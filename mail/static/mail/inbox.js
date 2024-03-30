document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click',() => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(r='', s='', b='') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = r;
  document.querySelector('#compose-subject').value = s;
  document.querySelector('#compose-body').value = b;
  // Get value
  


}
function showError(){
  let div = document.createElement('div');
  div.classList.add('alert', 'alert-info');
  div.innerHTML = "Error: Invalid Recipient!";
  document.querySelector('#compose-view').append(div);
}


document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#compose-form').onsubmit = () => {
    let recipient = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method:'POST',
      body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
      })
    })
    .then(response =>{
      if (response.status === 400)
      {
        showError();
        throw new Error ("Bad Response");
      }
      response.json()
    } )
    .then(data => {
        load_mailbox('sent');
    })
    .catch(err => {
      console.log(err);
    })
    return false;
  }
})

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  getEmails(mailbox);
}
let getEmails = (mailbox) => {
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(element => {
      const div = document.createElement('div');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const subContainer = document.createElement('div');
      subContainer.append(div1,div2);
      if (mailbox === 'sent')
      {
        div1.innerHTML = element.recipients;
      }
      else{
        div1.innerHTML = element.sender;
      }
      div2.innerHTML = element.subject;
      div3.innerHTML = element.timestamp;
      div.append(subContainer,div3);
      subContainer.classList.add('subContainer');
      div3.classList.add('timeStamp');
      div.classList.add('emailContainer');
      if (!element.read)
      {
        div.classList.add('unread');
      }
      document.querySelector('#emails-view').append(div);

      
      if (mailbox !== 'sent')
      {
        div.addEventListener('mouseenter', () => {
          let img = document.createElement('div');
          img.classList.add('imgContainer');
          div3.append(img);
          div3.classList.add('subContainer');
          img.addEventListener('click', (event) => {
            event.stopPropagation();
            markArchive(element).then(()=> {
              load_mailbox(mailbox);
            })
            
          })
        })
        div.addEventListener('mouseleave', () => {
          let img = document.querySelector('.imgContainer');
          div3.removeChild(img);
        })
      }
        div.addEventListener('click', () => {
          getEmail(element.id);
          markUnread(element.id);
        })
      
      });
  })
}

let getEmail = (id) => {
      fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(data => 
        {
          viewEmail(data);
        })
      .catch(err => {
        console.log(err);
      })
}
let markArchive = (email) => {
  return fetch(`/emails/${email.id}`, {
    method:'PUT',
    body: JSON.stringify({
      archived: (email.archived) ? false : true
    })
  })
}
let markUnread = (id) => {
  fetch(`/emails/${id}`, {
    method : 'PUT',
    body: JSON.stringify({
      read: true
    }) 
  })
}
let viewEmail = (email) => {
      let divContainer = document.createElement('div');
      let sender = document.createElement('div');
      let receiver = document.createElement('div');
      let subject = document.createElement('h4');
      let body = document.createElement('p');
      let timestamp = document.createElement('div');
      let btn = document.createElement('button');
      btn.classList.add('btn','btn-sm','btn-outline-primary');
      btn.type = 'button';
      btn.textContent = 'Reply';
      btn.setAttribute('id', 'reply');
      divContainer.classList.add('divContainer');
      sender.innerHTML = `<span>From:</span> ${email.sender}`;
      receiver.innerHTML =`<span>To:</span> ${email.recipients}`;
      subject.innerHTML =  `Subject: ${email.subject}`;
      body.innerHTML = email.body;
      timestamp.innerHTML = `<span>Timestamp:</span> ${email.timestamp}`;
      divContainer.append(subject, sender, receiver, timestamp, btn, body);
      let viewEmail = document.querySelector('#view-email');
      viewEmail.innerHTML = '';
      viewEmail.append(divContainer);
      document.querySelector('#emails-view').style.display = 'none';
      viewEmail.style.display = 'block';
      btn.addEventListener('click', () => {
        document.querySelector('#compose-recipients').disabled = true;
        document.querySelector('#compose-subject').disabled = true;
        let txt = ''
        if (!(email.subject).startsWith('Re:'))
        {
          txt = 'Re: '
        }
        compose_email(email.recipients, txt+email.subject, `On ${email.timestamp} wrote:\n${email.body}`);
      })
}