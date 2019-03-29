// Globals
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

appointments = {};
state = {};

onload=initialize();

function dateToKey(when)
{
    key = new Date(when);
    key.setHours(0,0,0,0);
    
    return key.valueOf();
}

function appointmentExists(when){ 
    return appointments[dateToKey(when)] != undefined;
}

function upinsertAppointment(when, title, description){
    
    if(!appointmentExists(when))
    {
        appointments[dateToKey(when)] = {};
        appointments[dateToKey(when)]["title"] = title;  
        appointments[dateToKey(when)]["description"] = description;
        sessionStorage["appointments"] = JSON.stringify(appointments);
    }
    else
    {
        appointments[dateToKey(when)]["title"] = title;  
        appointments[dateToKey(when)]["description"] = description;
        sessionStorage["appointments"] = JSON.stringify(appointments);
        return 0;
    }
}

function deleteAppointment(when){
    if(appointmentExists(when))
    {
        delete appointments[dateToKey(when)];  
        sessionStorage["appointments"] = JSON.stringify(appointments);
        return 0;
    }
    return -1;
}

function getAppointmentTitle(when)
{
    if(appointmentExists(when))
        return appointments[dateToKey(when)]["title"];
    else
        return "";
}

function getAppointmentDescription(when)
{
    if(appointmentExists(when))
        return appointments[dateToKey(when)]["description"];
    else
        return "";
}

function changeMonth(delta)
{
    state["selectedDate"].setMonth(state["selectedDate"].getMonth() + delta);
    state["selectedDate"].setHours(0,0,0,0);
    state["selectedDate"].setDate(1);
    sessionStorage["state"] = JSON.stringify(state);
    
    displayCalendar(state["selectedDate"]);   
}

function onRemove(id)
{
    deleteAppointment(new Date(id));
    
    displayCalendar(state["selectedDate"]);
}

function onShowModal(id, state)
{
    // Verifies if item exists and change the modal data.
    if(state)
    {
        when = new Date(id);
        document.getElementById("appointmentModal").style.display = "block";
        document.getElementById("appointmentID").value = id;
        document.getElementById("modalError").classList.add("w3-hide");
        document.getElementById("modalErrorDescription").innerHTML = "";
        document.getElementById("appoitmentTitle").classList.remove("w3-border-red");
        
        if(appointmentExists(when))
        {
            document.getElementById("appointmentModal_title").innerHTML = monthNames[when.getMonth()] + ", " + when.getDate().toString().padStart(2,"0") + " " + when.getFullYear() + ": "  + getAppointmentTitle(when);
            document.getElementById("appoitmentTitle").value = getAppointmentTitle(when);
            document.getElementById("appoitmentDescription").value = getAppointmentDescription(when);
            
        }    
        else
        {
            document.getElementById("appoitmentTitle").value = "";
            document.getElementById("appoitmentDescription").value = "";
            document.getElementById("appointmentModal_title").innerHTML = monthNames[when.getMonth()] + ", " + when.getDate().toString().padStart(2,"0") + " " + when.getFullYear() + ": New Appointment";
        }
    }   
    else
    {
        document.getElementById("appointmentModal").style.display = "none";
    }   
}

function onSave()
{
    if(document.getElementById("appoitmentTitle").value == undefined || document.getElementById("appoitmentTitle").value.length < 5)
    {
        document.getElementById("modalError").classList.remove("w3-hide");
        document.getElementById("modalErrorDescription").innerHTML = "The Title must have at least 5 characters";
        document.getElementById("appoitmentTitle").classList.add("w3-border-red");
        document.getElementById("appoitmentTitle").focus();
        return;
    }
    
    when = new Date(parseInt(document.getElementById("appointmentID").value));
    upinsertAppointment(when, document.getElementById("appoitmentTitle").value, document.getElementById("appoitmentDescription").value);
    
    onShowModal(null, false);   
    
    // Display the current Calendar.
    displayCalendar(state["selectedDate"]);
}

function clearCalendar()
{
    // Header
    document.getElementsByClassName("title").item(0).innerHTML= "";
    
    // Clear all values
    for(col = 0; col < 7; col++)
    {
        for(row = 0; row<6; row++)
        {
            id = row.toString().padStart(2,"0") + "_" + col.toString().padStart(2,"0");
            calendarDay = document.getElementById(id);
            calendarDay.innerHTML = "";
       }
    }
    
    // Hide all rows
    for(i=0; i<6;i++)
    {
        document.getElementById(i.toString().padStart(2,"0")).classList.add("w3-hide");        
    }
}

function displayCalendar(when)
{
    // Clear Calendar
    clearCalendar();
    
    // Header
    document.getElementsByClassName("title").item(0).innerHTML= monthNames[when.getMonth()] + " " + when.getFullYear();
    
    // Days
    now = new Date();
    now.setHours(0,0,0,0);
    
    firstDay = new Date(when.getFullYear(), when.getMonth(), 1);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay())
    
    lastDay = new Date(when.getFullYear(), when.getMonth() + 1, 0);
    lastDay.setDate(lastDay.getDate() + 6 - lastDay.getDay());
    
    day = firstDay; 
    maxDay = lastDay; 
    row = -1;
    
    while(day.valueOf() <= maxDay.valueOf())
    {
        // Find coordinates.
        col = day.getDay();
        
        // Verifies if a new row must be created.
        if(col == 0)
        {
            row++;
            document.getElementById(row.toString().padStart(2,"0")).classList.remove("w3-hide");
        }
                        
        // Creates a new Day.
        id = row.toString().padStart(2,"0") + "_" + col.toString().padStart(2,"0");
        calendarDay = document.getElementById(id);
        
        // If day is in current Month, set day number.
        if(day.getMonth() == when.getMonth())
        {
            if(day.valueOf() >= now.valueOf())
            {
                currentDarkClass = day.valueOf() == now.valueOf() ? " w3-amber" : "";
                currentLightClass = day.valueOf() == now.valueOf() ? " w3-pale-yellow" : " w3-light-grey";

                // Has appointments?
                if(appointmentExists(day))
                {
                    calendarDay.innerHTML = "<div class=\"w3-row w3-hover-gray" + currentLightClass + "\" style=\"height: 100%;\"><div class=\"w3-col s2 w3-center w3-text-dark-grey" + currentDarkClass + "\">" + day.getDate() + "</div><div class=\"w3-col s8 w3-container w3-cell w3-cell-middle clicable\" onClick=\"onShowModal(" + day.valueOf() + ", true);\"><div class=\"w3-dropdown-hover w3-medium" + currentLightClass + "\">" + getAppointmentTitle(day) + "<div class=\"w3-dropdown-content appointmentInfo\"><div class=\"w3-card-4\"><header class=\"w3-container w3-dark-grey\"><h3>" + monthNames[day.getMonth()] + ", " + day.getDate().toString().padStart(2,"0") + " " + day.getFullYear() + ": " + getAppointmentTitle(day) + "</h3></header><div class=\"w3-container\"><p>" + getAppointmentDescription(day) + "</p></div></div></div></div></div><div class=\"w3-col s2 w3-center w3-hover-light-grey" + currentDarkClass + "\" onclick=\"onRemove(" + day.valueOf() + ");\"><i class=\"far fa-trash-alt\"></i></div></div>";
                }
                else
                {
                    calendarDay.innerHTML = "<div class=\"w3-row\"><div class=\"w3-col s12 w3-center w3-text-dark-grey w3-hover-dark-grey w3-hover-text-white clicable" + currentDarkClass + "\" onClick=\"onShowModal(" + day.valueOf() + ", true);\">" + day.getDate() + "</div></div>";
                }
            }
            else
                calendarDay.innerHTML = "<div class=\"w3-row\"><div class=\"w3-col s12 w3-center w3-text-grey\">" + day.getDate() + "</div></div>";
        }
        
        // Add one day
        day.setDate(day.getDate() + 1);  
    }
}

function initialize()
{
    // Fill the title with the month name
    state = sessionStorage["state"];
    if(state == undefined)
    {
        state = {};
        state["selectedDate"] = new Date();
        state["selectedDate"].setHours(0,0,0,0);
        state["selectedDate"].setDate(1);
        sessionStorage["state"] = JSON.stringify(state);
    }
    else
    {
        state = JSON.parse(sessionStorage["state"]);
        state["selectedDate"] = new Date(state["selectedDate"]);
    }
    
    appointments = sessionStorage["appointments"];
    if(appointments == undefined)
    {
        appointments = {};
        sessionStorage["appointments"] = JSON.stringify(appointments);
    }
    else
        appointments = JSON.parse(sessionStorage["appointments"]);
    
    // Display the current Calendar.
    displayCalendar(state["selectedDate"]);
    
}