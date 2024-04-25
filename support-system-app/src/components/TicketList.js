import React from "react";

const TicketList = (props) => {
    const ticketInfo = props.ticketInfo;

    // // Handle when ticketInfo is null or undefined
    if (!ticketInfo) {
        return <div>Loading...</div>; // or any other loading indicator
    }

    // Ensure ticketInfo is an array before mapping over it
    if (!Array.isArray(ticketInfo)) {
        console.log(typeof ticketInfo);
        console.error("ticketInfo is not an array:", ticketInfo);
        return null; // or display an error message
    }

    // Extract the values from the object if it's not an array
    const tickets = Array.isArray(ticketInfo) ? ticketInfo : Object.values(ticketInfo);

    return (<div >
        {tickets !== null ?

            <select className="bg-gray-600 form-control" name="ticketList" onChange={() => props.populateFields()}>
                <option value="default">Select a ticket</option>
                {tickets !== null ? tickets.forEach((ticket, i) => {
                    return (<option key={i} data-level={ticket.priority} value={ticket.uuid}>{ticket.ticketId.substring(ticket.ticketId.lastIndexOf(":") + 1) + " (priority: " + ticket.priority + ")"}</option>)
                }) : null}
            </select>
            : null
        }
    </div>)
}

export default TicketList;
