function Bifrost(myCalendar) { return window.__Bifrost = myCalendar }
function qaData(emailData) { return window.__qaData = emailData }

function closeModal() {
  $('#myModal').hide(); // Exibe a modal
  $('#circle').css("display", "flex");
}

function openModal() {
  $('#myModal').show(); // Exibe a modal
  $('#circle').hide()
}

//Load CDNs
function loadScript(url) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = resolve(`Fully loaded: ${url}`);
    script.onerror = reject(`Loading error: ${url}`);
    document.head.appendChild(script);
  });
}
//Load CSS
function loadCSS(url) {
  return new Promise((resolve, reject) => {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve(`Fully loaded: ${url}`);;
    link.onerror = reject(`Loading error: ${url}`);;
    document.head.appendChild(link);
  });
}

//Valida o Calendar ID (MODAL 1)
async function validateId() {
  const input = $(".modal-input input").val()
  let calendarId = document.cookie.match(/calendarKey=(.{52})/);

  const msgContainer = document.querySelector(".message-container")
  const message = document.createElement("div")
  $('.input-modal > input').prop('disabled', true)
  $('#checkButton').prop('disabled', true)

  try {
    await validateKey()
    await insertModal2()
  }
  catch (err) {
    if (err.message === 'INVALID CALENDAR_ID') {
      //Reativa os inputs do modal 1 para refazer a validação
      $('.input-modal > input').prop('disabled', false)
      $('#checkButton').prop('disabled', false)
      $(msgContainer).html("")
      $(message).text("Error: Insert your own Calendar ID!")
      msgContainer.appendChild(message);
    }
    if (err.message === 'MODAL2 HTML FAILED') {
      $('.input-modal > input').prop('disabled', false)
      $('#checkButton').prop('disabled', false)
      $(msgContainer).html("")
      $(message).text("Erro de servidor")
      msgContainer.appendChild(message);
    }
  }
}

function insertModal2() {
  return new Promise(async (resolve, reject) => {
    const selectDiv = document.createElement("div")
    $(selectDiv).addClass("modal-select")
    $('.modal-body').html("")
    $('.modal-body')[0].appendChild(selectDiv)

    //Criacao da div que contem os select
    await fetch('https://cdn.jsdelivr.net/gh/FeliksLv/testCDN/html/autopilot.html')
      .then(response => {
        if (!response.ok) { reject(new Error('MODAL2 HTML FAILED')) }
        else { return response.text() }
      }).then(temp => {
        $('.modal-select').html(temp)
        resolve()
      })
  })
}

function validateKey() {
  return new Promise(async (resolve, reject) => {
    let calendarKey = document.cookie.match(/calendarKey=(.{52})/);
    calendarKey != null && await updateCalendar(calendarKey[1]) ? resolve() : reject(new Error("INVALID CALENDAR_ID"))
  })
}

function updateCalendar(key) {
  return new Promise(async (resolve, reject) => {
    let timer = 0
    const interval = 200
    $(".myCalendar").remove()
    var script = document.createElement('script');
    $(script).addClass("myCalendar")
    window.__Bifrost ? window.__Bifrost = undefined : null
    script.type = 'text/javascript';
    script.src = `https://script.google.com/a/macros/google.com/s/AKfycbwTbgE5PuM0JhS9duULuJdCkMsAvIoDx-hgeEr_rS4/dev?key=${key}&portal=Bifrost`;
    document.head.appendChild(script);


    while (timer < 4000) {
      if (window.__Bifrost !== undefined && __Bifrost.data.length) {
        console.log(`%cValid Calendar ID`, "color: green")
        resolve(true)
        return
      }
      await new Promise(resolve => setTimeout(resolve, interval));
      timer += interval
    }
    resolve(false)
  })
};

//Handles select tags visibility
function handleSelect(event) {
  let selectType = document.querySelector('#temp_type')
  let selectEmail = document.querySelector('#templateEmail')
  let reschInputs = ['#resch_date', '#resch_time', '#resch_period']
  if (event.target === selectType) {
    //Default select behavior
    $('#showTime').attr('disabled', true)
    $(selectEmail).attr('disabled', false)
    $(selectEmail).val('default');
    reschInputs.forEach((input, i) => {
      $(input).attr('disabled', true)
      i === 0 ? $(input).val('') : $(input).val('default')
    })
    //Handle Visibility Options
    for (option of selectEmail) {
      if ($(selectType).val() === "leadGen") { option.value.includes("lg") ? $(option).show() : $(option).hide() }
      if ($(selectType).val() === "tag") { option.value.includes("ts") ? $(option).show() : $(option).hide() }
      if ($(selectType).val() === "external") { option.value.includes("ext") ? $(option).show() : $(option).hide() }
      if ($(selectType).val() === "default") { option.value.includes("default") ? $(option).show() : $(option).hide() }
    }
  }

  if (event.target === selectEmail) { $(selectEmail).val().match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/) ? handleResch() : noReschedule() }
  if (reschInputs.some(input => event.target === $(input)[0])) { reschInputs.every(input => $(input).val() !== '' && $(input).val() !== 'default') ? $('#showTime').attr('disabled', false) : $('#showTime').attr('disabled', true) }

  function noReschedule() {
    $('#showTime').attr('disabled', false)
    if ($(selectEmail).val() !== 'default') {
      reschInputs.forEach((input, i) => {
        $(input).attr('disabled', true)
        i === 0 ? $(input).val('') : $(input).val('default')
      })
    }
    else {
      $('#showTime').attr('disabled', true)
      reschInputs.forEach((input, i) => {
        $(input).attr('disabled', true)
        i === 0 ? $(input).val('') : $(input).val('default')
      })
    }
  }

  function handleResch() {
    $('#showTime').attr('disabled', true)
    reschInputs.forEach(input => $(input).attr('disabled', false))
  }
}

//Make the modal draggable
function dragModal(event) {
  if (event.target.closest('.modal-header')) {
    $("#myModal").draggable({
      disabled: false,
      cursor: "grab",
    })
  }
  else { $("#myModal").draggable({ disabled: true }) }
}
//Timepicker config
function timePickerConfig() {
  for (var hh = 1; hh <= 12; hh++) {
    for (var mm = 0; mm < 60; mm += 15) {
      var formattedHh = hh.toString().padStart(2, '0');
      var formattedMm = mm.toString().padStart(2, '0');
      var fullTime = `${formattedHh}:${formattedMm}`
      var option = document.createElement('option')
      option.value = fullTime;
      option.text = fullTime;
      document.querySelector('#resch_time').appendChild(option);
    }
  }
}
//Get active cases tab
function getActiveTab() {
  return [...$('write-deck > div > div')].reduce((acc, e) => {
    return ($(e).attr('style') === '' ? e : acc)
  })
}
//Creates __caseData responsible for save all data of the current active case 
function bulkBifrost() {
  return new Promise(async (resolve, reject) => {
    try {
      $('[aria-label="Case log"]')[0].click()
      $('profile material-button')[0].click()
      await waitForEntity('profile-details', 'agent_data', 'sel')
      var bulkData = { activeCase: $('[data-case-id]').attr('data-case-id'), agent: $('profile-details .name').text().split(' ')[0] }

      for (const message of $('.active-case-log-container case-message-view')) {
        if ($(message).html().includes('An appointment has been successfully created')) {
          message.querySelector('div > div').click()
          await waitForEntity('.message-body.message-body1', 'extra_information', 'from', message)
          var region = /(?<=\[)(.*?)(?=\])/
          var richContent = $(message.querySelector('.message-body.message-body1')).text()
          //Get Name only returns DEFAULT on tabs other than a case tab
          bulkData.timezone = richContent.match(region)[0];
          bulkData.name = [...document.querySelectorAll('action-bar input')].reduce((acc, e, i) => { return (e.value !== '' && i === 0 ? e.value : acc) }, 'DEFAULT')
        }
        else if ($(message).html().includes('Review case in Connect Sales')) {
          message.querySelector('div > div').click()
          await waitForEntity('.message-body.message-body1', 'extra_information', 'from', message)
          let sellerInfo = message.querySelectorAll('.message-body1 [href*="connect.corp.google.com" ]')[1].parentElement.innerText.match(/(?<=by )(.*)(?= and)/)[0].trim()
          bulkData.sellerInfo = { email: sellerInfo.match(/(?<=\()(.*)(?=\))/)[0], name: sellerInfo.match(/(.*)(?=\()/)[0].trim() }

          for (const data of $('.message-body.message-body1 tbody > tr')) {
            $(data.querySelector('td:first-child')).text() === 'Tasks' ? bulkData.task = $(data.querySelector('td:last-child')).text()
              : $(data.querySelector('td:first-child')).text() === 'Sales Program' ? bulkData.program = $(data.querySelector('td:last-child')).text()
                : $(data.querySelector('td:first-child')).text() === 'Website' ? bulkData.website = $(data.querySelector('td:last-child')).text() : null
          }
        }
      }

      if (__Bifrost.data.find(data => data.case_id === bulkData.activeCase)) {
        if ($('#templateEmail').val().match(/(?:ts as resched1|ts as reschedok|lg as resched1|lg as reschedok)\b/)) {
          let reschAppointment = `${$('#resch_date').val()} ${$('#resch_time').val()} ${$('#resch_period').val()}`
          window.__caseData = __Bifrost.data.reduce((acc, data) => {
            return (bulkData.activeCase === data.case_id ? {
              ...data, appointment: moment.tz(reschAppointment, 'DD-MM-YYYY hh:mm A', 'America/Sao_Paulo').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
              name: bulkData.name, program: bulkData.program, sellerInfo: bulkData.sellerInfo, website: bulkData.website, agent: bulkData.agent
            } : acc)
          }, {})

          console.log(__caseData)

          resolve()
        }
        else {
          window.__caseData = __Bifrost.data.reduce((acc, data) => {
            return (bulkData.activeCase === data.case_id ? {
              ...data, appointment: moment.tz(data.appointment, 'UTC').tz(bulkData.timezone).format('DD/MM/YYYY - hh:mm A'),
              name: bulkData.name, program: bulkData.program, sellerInfo: bulkData.sellerInfo, website: bulkData.website, agent: bulkData.agent
            } : acc)
          }, {})

          console.log(__caseData)

          resolve()
        }
      }
      else { reject("CASE NOT FOUND") }
    }
    catch (error) { reject("BIFROST BULK ERROR") }
  })
}

function waitForEntity(el, id, type, origin) {
  return new Promise(async (resolve, reject) => {
    let timer = 0
    const interval = 500

    while (timer < 20000) {
      if (type === 'sel' && document.querySelectorAll(el)[0]) {
        console.log(`%cSelector ${id} has been found`, "color: orange")
        resolve();
        return
      }
      if (type === 'from' && origin.querySelectorAll(el)[0]) {
        console.log(`%cSelector ${id} has been found`, "color: orange")
        resolve();
        return
      }
      await new Promise(resolve => setTimeout(resolve, interval));
      timer += interval
    }
    reject(new Error(`%cEntity ${id} was not found`))
  })
};

function loadScript(url) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = resolve(`Fully loaded: ${url}`);
    script.onerror = reject(`Loading error: ${url}`);
    document.head.appendChild(script);
  });
}


async function newEmail() {
  return new Promise(async (resolve, reject) => {
    try {
      if ($('[aria-label="Create a write card"]').length) {
        var cards = $('write-deck #email-body-content-top-content').length
        $('[aria-label="Create a write card"]')[0].dispatchEvent(new Event('focus'))
        await waitForEntity('[aria-label="Create new email"]', 'Lateral_bar', 'sel')
        $('[aria-label="Create new email"]')[0].click()

        console.log("%cCreated email", "color: green")
        await newEmailAlert(cards)
        resolve()
      }
      else {
        reject("WRONG PAGE")
      }
    }
    catch (error) { reject(error) }
  })
};

function newEmailAlert(length) {
  return new Promise((resolve, reject) => {
    var init = $('write-deck #email-body-content-top-content').length
    var interval = setInterval(() => {
      if ($('write-deck #email-body-content-top-content').length !== length) {
        if ($('write-deck #email-body-content-top-content').length === 1) {
          resolve()
          clearInterval(interval)
        }
        else {
          reject('MANY EMAIL CARDS OPEN')
          clearInterval(interval)
        }
      }
    }, 100)
  })
}

async function getActiveCard() {
  return new Promise((resolve, reject) => {
    let cards = getActiveTab().querySelectorAll('card')
    for (const element of cards) {
      if ($(element).attr('aria-hidden') === 'false' && $(element).attr('card-type') === "compose") {
        window.__activeCard = {
          'element': element,
          'type': $(element).attr('card-type'),
          'selectedTemp': $("#templateEmail").val()
        }
        console.log(`%c${window.__activeCard.type} card detected`, "color: green")
        resolve()
      }
    }
    reject("EMAIL CARD NOT FOUND")
  })
}

async function updateAdresses() {
  return new Promise(async (resolve, reject) => {
    try {
      //Update the sender
      let dropdownEmails = 'material-select-dropdown-item[id*="email-address-id--"]';
      await waitForEntity('.address[buttoncontent]', 'dropdownButton', 'from', __activeCard.element)
      //Timeout
      __activeCard.element.querySelector('.address[buttoncontent]').click();
      await waitForEntity(dropdownEmails, 'dropdownEmails', 'sel');
      //Change to: technical-solutions@google.com
      [...$(`${dropdownEmails} > span`)].forEach(email => { $(email).text() === 'technical-solutions@google.com' ? email.click() : null })
      //Update the attendees
      __activeCard.element.querySelector('[aria-label="Show CC and BCC fields"]') ? __activeCard.element.querySelector('[aria-label="Show CC and BCC fields"]').click() : null
      await waitForEntity('[aria-label="Enter Cc email address"]', 'emailAdresses', 'from', __activeCard.element)
      await removeDefaultEmails()
      //Update all of the calendar attendees including the seller
      await insertNewEmails()
      console.log("%cModified attendees", "color: green")
      resolve()
    }
    catch (err) {
      console.log(err)
      reject("ERROR UPDATING ADRESSES")
    }
  })
}

function insertNewEmails() {
  return new Promise(async (resolve) => {
    let toField = '[aria-label="Enter To email address"]'
    let ccField = '[aria-label="Enter Cc email address"]'
    let bccField = '[aria-label="Enter Bcc email address"]'
    let bccPrograms = ['Olympus', 'PKA', 'pka']
    let sellerTemps = __qaData.reduce((acc, e) => {
      return (e.to === 'seller' ? [...acc, e.crCode] : acc)
    }, [])

    await waitForEntity(toField, 'To: Field', 'sel')
    //To seller
    if (sellerTemps.includes(__activeCard.selectedTemp)) {
      console.log("%cTo Seller", "color: orange")
      $(toField).val(__caseData.sellerInfo.email)
      updateInput(toField)
      resolve()
    }
    //To customer
    else {
      $(toField).val(__caseData.attendees.toString())
      updateInput(toField)

      if (bccPrograms.some(e => __caseData.program.includes(e))) {
        $(bccField).val(__caseData.sellerInfo.email)
        updateInput(bccField)
        resolve()
      }
      else {
        $(ccField).val(__caseData.sellerInfo.email)
        updateInput(ccField)
        resolve()
      };
    }

    function updateInput(input) {
      let inputEvent = new Event('input', { bubbles: true });
      let kbEvent = new KeyboardEvent('keydown', { key: ',', keyCode: 188, which: 188 });
      $(input)[0].dispatchEvent(kbEvent);
      $(input)[0].value += ',';
      $(input)[0].dispatchEvent(inputEvent);
    }
  })
}
function removeDefaultEmails() {
  return new Promise(async (resolve) => {
    for (const emails of __activeCard.element.querySelectorAll('[aria-label*="Remove"]')) {
      __activeCard.element.querySelector('[aria-label*="Remove"]').click()
      await new Promise(resolve => setTimeout(resolve, 150));
      __activeCard.element.querySelectorAll('[aria-label*="Remove"]').length === 0 ? resolve() : null
    }
  })
}

function insertTemplate() {
  return new Promise(async (resolve, reject) => {
    if (document.querySelectorAll('write-deck #email-body-content-top-content').length === 1) {
      if ($('#templateEmail').val().includes('ext')) {
        //External template
        var temp_data = await getExternalTemp()
        $(__activeCard.element.querySelector('#email-body-content-top-content')).html(temp_data.content)
        resolve()
      }
      else {
        //Non external template
        $('[aria-label="Insert canned response"]')[0].click()
        await waitForEntity('canned-response-dialog input', 'Canned_response input', 'sel')
        $('canned-response-dialog input').val($('#templateEmail').val())
        $('canned-response-dialog input')[0].dispatchEvent(new Event('input', { bubbles: true }));
        await waitForEntity('material-select-dropdown-item span', 'Canned_response Dropdown', 'sel')
        $(__activeCard.element.querySelector('#email-body-content-top-content')).html('<p dir="auto"><br></p>')
        $('material-select-dropdown-item span')[0].click()
        await insertedTempAlert()
        console.log("%cInserted template ", "color: green")
        resolve()
      }
    }
    else {
      reject('MANY EMAIL CARDS OPEN')
    }
  })
}

function getExternalTemp() {
  return new Promise((resolve) => {
    var signature = $(__activeCard.element.querySelector('#email-body-content-top-content > .replaced:last-child')).html()
    var ext_files = [
      { temp: 'ext attempt_es', file: 'attemptContact_es.html', title: 'Implementación con Equipo de Soluciones Técnicas de Google -  Se intentó Contactar' },
      { temp: 'ext attempt_pt', file: 'attemptContact_pt.html', title: 'Implementação com o Time de Soluções Técnicas do Google - Tentativa de Contato' },
      { temp: 'ext 3/9_es', file: 'day3_es.html', title: '[DÍA 3] Consulta con el equipo de Soluciones Técnicas de Google - [{url}]' },
      { temp: 'ext 3/9_pt', file: 'day3_pt.html', title: '[DIA 3 Acompanhamento] Consultoria com a Equipe de Soluções Técnicas do Google - [{url}]' },
      { temp: 'ext 6/9_es', file: 'day6_es.html', title: '[DÍA 6] Consulta con el equipo de Soluciones Técnicas de Google - [{url}]' },
      { temp: 'ext 6/9_pt', file: 'day6_pt.html', title: '[DIA 6 Acompanhamento] Consultoria com a Equipe de Soluções Técnicas do Google - [{url}]' },
      { temp: 'ext mms_es', file: 'mms_es.html', title: '[Acción Requerida] {case_id} - Cita de implementación de etiquetas de Google para Conversiones Mejoradas para su sitio web' },
      { temp: 'ext mms_pt', file: 'mms_pt.html', title: '[Ação necessária] {case_id} - Agendamento de implementação de tags do Google para Conversões Otimizadas para site' },
    ]

    for (const item of ext_files) {
      if (item.temp === $('#templateEmail').val()) {
        fetch(`https://cdn.jsdelivr.net/gh/FeliksLv/testCDN@latest/templates/${item.file}`)
          .then(response => {
            if (!response.ok) { reject('CDN ERROR') }
            else { return response.text() }
          }).then(temp => {
            resolve({ content: `${temp}<br/>${signature}`, title: item.title })
          })
      }
    }
  })
}

function insertedTempAlert() {
  return new Promise((resolve) => {
    var tempInserted = setInterval(() => {
      if ($('.visual-message')[0] && $('.visual-message').text() === 'Canned response inserted') {
        clearInterval(tempInserted)
        resolve()
      }
    }, 100)
  })
}

function autoFill() {
  return new Promise(async (resolve) => {
    let inputEvent = new Event('input', { bubbles: true });
    if ($('#templateEmail').val().includes('ext')) {
      //Logic to autofill external temps
      var content = $(__activeCard.element.querySelector('#email-body-content-top-content')).html()
      var mapTerms = { '{advertiser}': __caseData.name, '{phone}': __caseData.phone, '{url}': __caseData.website, '{case_id}': __caseData.case_id, '{agent}': __caseData.agent, '{meet}': __caseData.meet }
      content = content.replace(/\{(?:advertiser|url|case_id|phone|agent|meet)\}/g, matched => mapTerms[matched])
      $(__activeCard.element.querySelector('#email-body-content-top-content')).html(content)
      resolve()
    }
    else {
      let selectedTemp = __qaData.reduce((acc, e) => { return e.crCode === __activeCard.selectedTemp ? e : acc })
      let sections = __activeCard.element.getElementsByTagName('tr')


      if (selectedTemp.inputs.appointment) {
        $(__activeCard.element.querySelector(selectedTemp.inputs.appointment)).html(__caseData.appointment)
        $(__activeCard.element.querySelector(selectedTemp.inputs.appointment)).removeClass('field')
      }
      if (selectedTemp.inputs.name) {
        $(__activeCard.element.querySelector(selectedTemp.inputs.name)).html(__caseData.name)
        $(__activeCard.element.querySelector(selectedTemp.inputs.name)).removeClass('field')
      }
      if (selectedTemp.inputs.phone) {
        $(__activeCard.element.querySelector(selectedTemp.inputs.phone)).html(__caseData.phone)
        $(__activeCard.element.querySelector(selectedTemp.inputs.phone)).removeClass('field')
      }
      if (selectedTemp.inputs.nothing) {
        console.log('No fields');
      }
      for (element of sections) {
        element.innerText === 'Soluciones Técnicas de Google' || element.innerText === 'Soluções técnicas da Google' ? element.remove() : null
      }
      resolve()
    }
    __activeCard.element.querySelector('[aria-label="Email body"]').dispatchEvent(inputEvent)
    console.log("%cAutofilled", "color: green")
  })
}

function showSuccess(msg = 'Successful execution') {
  return new Promise((resolve) => {
    $('.alert').on("animationend", (e) => {
      $('.alert').removeClass(["default", "hide"]);
      $('.alert > span:first-child').removeClass(["fa-magic"]);
      $('.alert > span:first-child').addClass("fa-check-circle");
      $('.alert').addClass(["show", "success"]);
      $(".msg").text(msg)
      $('.close-btn').show()
      $('.alert').off()

      gtag('event', 'successfuly_Attached', { send_to: `G-XKDBXFPDXE`, case: __caseData.case_id })
      resolve()
    })
  })
}
function showError(msg) {
  return new Promise((resolve) => {
    $('.alert').on("animationend", (e) => {
      $('.alert').removeClass(["default", "hide"]);
      $('.alert > span:first-child').removeClass(["fa-magic"]);
      $('.alert > span:first-child').addClass("fa-exclamation-circle");
      $('.alert').addClass(["show", "error"]);
      $(".msg").text(msg)
      $('.close-btn').show()
      $('.alert').off()
      resolve()
    })
  })
}
function removeError() {
  return new Promise((resolve) => {
    $(".close-btn").on("click", (e) => {
      $('.alert').removeClass("show");
      $('.alert').addClass("hide");
      clearTimeout(closeAlert)
      $('.alert').off()
      resolve()
    })
    var closeAlert = setTimeout(() => {
      $('.close-btn').hide()
      $('.alert').removeClass("show");
      $('.alert').addClass("hide");
      $('.alert').off()
      resolve()
    }, 3000);
  })
}
function showDefault(msg = 'Waiting for instructions') {
  return new Promise(async (resolve) => {
    $('.alert').on("animationend", (e) => {
      $('.alert').removeClass(["hide", "error", "success"]);
      $('.alert > span:first-child').removeClass(["fa-exclamation-circle", "fa-check-circle"]);
      $('.alert > span:first-child').addClass("fa-magic");
      $('.alert').addClass(["show", "default"]);
      $(".msg").text(msg)
      $('.close-btn').hide()
      $('.alert').off()
      resolve()
    })
  })
}

function init() {
  return new Promise(async (resolve) => {
    try {
      await ga4Setup()
      await loadCSS("https://cdn.jsdelivr.net/gh/FeliksLv/testCDN/css/stylesheet.css")
      await loadCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+Shavian&family=Poppins:wght@300&display=swap')
      await loadCSS("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css")
      await loadScript("https://code.jquery.com/jquery-3.7.1.min.js");
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadModal()
      await loadScript('https://momentjs.com/downloads/moment.min.js');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadScript("https://code.jquery.com/ui/1.13.2/jquery-ui.min.js");
      await loadScript("https://momentjs.com/downloads/moment-timezone-with-data-10-year-range.min.js");
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadScript("https://script.google.com/a/macros/google.com/s/AKfycbznkfAXGOVgDS385t_czkBUD9rhLV3o4Xz87vsJmn3YrjajDE5m_BjTaUuABxTmpUJk/exec?portal=qaData");
      await loadCSS('https://code.jquery.com/ui/1.13.2/themes/dark-hive/jquery-ui.css')
      resolve()
    }
    catch (error) {
      console.error('Erro ao carregar CDN');
    }
  })
}

/*User AUTH*/
function loadModal() {
  return new Promise(async (resolve) => {
    try {
      await fetch('https://cdn.jsdelivr.net/gh/FeliksLv/testCDN/html/firstModal.html')
        .then(response => response.text()).then(temp => { $('.modal-container').html(temp) })
      await validateKey()
      await insertModal2()
      console.log("%cAuthenticated user", "color: green")
      resolve()
    }
    catch (err) {
      console.log(err)
      console.log("%cNew user", "color: green")
      resolve()
    }
  })
}

async function attachEmail() {
  return new Promise(async (resolve, reject) => {
    try {
      await validateKey()
      await newEmail()
      await bulkBifrost()
      await getActiveCard()
      await updateAdresses()
      await insertTemplate()
      await autoFill()
      resolve()
    }
    catch (error) { reject(error) }
  })
};

async function ga4Setup() {
  await loadGA4()
  await new Promise(resolve => setTimeout(resolve, 1000));
  var user = JSON.parse(window.clientContext).userEmail.replace('@google.com', '')
  gtag('config', 'G-XKDBXFPDXE', {
    'debug_mode': true, 'user_id': user, 'user_properties': {
      'user_ID': user
    }
  });
  gtag('event', 'initialized', { send_to: 'G-XKDBXFPDXE' })
}

function loadGA4() {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.async = true
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-XKDBXFPDXE";
    script.onload = resolve(`Fully loaded`);
    script.onerror = reject(`Loading error`);
    document.head.appendChild(script);
  });
}

function saveCookie(element) {
  if ($(element.target).is('.input-modal > input')) {
    let date = new Date()
    date.setDate(date.getDate() + 400)
    document.cookie = `calendarKey=${$(element.target).val().trim()}; expires=${date.toUTCString()}; Priority=High`
  }
}
async function errorClosure(msg) {
  $('.alert').removeClass("show")
  $('.alert').addClass("hide")
  await showError(msg)
  await removeError()
  await showDefault()
  $('#temp_type, #templateEmail, #showTime').prop('disabled', false)
  $('#showTime').html('Inserir<i class="fa fa-cog"></i>')

  gtag('event', 'error_Attaching', {
    send_to: `G-XKDBXFPDXE`, case: __caseData.case_id, type: msg
  })
};

(async function main() {
  await init();
  const dateConfig = {
    dateFormat: 'dd-mm-yy',
    changeMonth: true,
    changeYear: true,
    minDate: new Date(),
    yearRange: "c-0:c+1",
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
    dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  }

  $(window).on("change", handleSelect);
  $(window).on("mouseover", dragModal);
  $(window).on("input", saveCookie);
  $(window).on("click", (e) => {
    $(e.target).is('#checkButton') ? validateId()
      : e.target.closest('#closeModal') ? closeModal()
        : e.target.closest('#circle') ? openModal()
          : $(e.target).is('#showTime') ? console.log('Showtime!') : null
  });

  var modalLoaded = setInterval(() => {
    if ($('#resch_time').length) {
      //MODAL 2 CONFIG
      clearInterval(modalLoaded);
      timePickerConfig()
      $(function () { $("#resch_date").datepicker(dateConfig) })

      $('#showTime').on("click", async () => {
        let selectEmail = document.querySelector('#templateEmail')
        let reschInputs = ['#resch_date', '#resch_time', '#resch_period']

        //Remove Default + Transition
        $('#showTime').html('Loading<i class="fa fa-cog fa-spin"></i>')
        $('#temp_type, #templateEmail, #resch_date, #resch_time, #resch_period, #showTime').prop('disabled', true)
        $('.alert').removeClass("show")
        $('.alert').addClass("hide")
        showDefault('Working...')

        try {
          await attachEmail()
          $('.alert').removeClass("show")
          $('.alert').addClass("hide")
          await showSuccess()
          await removeError()
          await showDefault()

          $('#temp_type').attr('disabled', false)
          $('#temp_type').val('default')
          $('#temp_type')[0].dispatchEvent(new Event('change', { bubbles: true }))
          $('#showTime').html('Insert<i class="fa fa-cog"></i>')
        }
        catch (err) {
          err === "BIFROST BULK ERROR" ? errorClosure("Error fetching your data")
            : err === "MANY EMAIL CARDS OPEN" ? errorClosure("Send your other emails!")
              : err === "ERROR UPDATING ADRESSES" ? errorClosure('Error attaching emails')
                : err === "WRONG PAGE" ? errorClosure("Focus a case page")
                  : err === "EMAIL CARD NOT FOUND" ? errorClosure("None card was detected")
                    : err === "CASE NOT FOUND" ? errorClosure("Case not found in your calendar")
                      : err === "CDN ERROR" ? errorClosure("Unexpected server error") : errorClosure(err)
        }
      })
    }
  }, 100)
})();