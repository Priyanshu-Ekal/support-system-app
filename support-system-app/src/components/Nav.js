import React, { useState, useEffect } from "react";

const Nav = (props) => {
    let [mobileNav, setMobileNav] = useState(false);
    const toggleMobileNav = (whatSection) => {
        props.setActiveModule((activeModule) => whatSection);
        localStorage.setItem("activeModule", whatSection);

        if (mobileNav === false) {
            setMobileNav((mobileNav) => true);
        } else {
            setMobileNav((mobileNav) => false);
        }
    }

    return (<nav className="bg-gray-800 navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <a className="text-white navbar-brand" href="#">{props.userEmail}</a>
        <button className="text-white navbar-toggler" onClick={() => toggleMobileNav()}>
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className={mobileNav === false ? "bg-gray-600 collapse navbar-collapse" : "bg-gray-600 collapse navbar-collapse show animiated fadeIn"}>

            <ul className="bg-gray-600 navbar-nav mr-auto">
                {sessionStorage.getItem("activeTicket") ?
                    <li className="nav-item">
                        <a className="bg-gray-600 nav-link" href="#messageBoard">Messages <i className="fas fa-comment"></i></a>
                    </li> : null}
                <li className={props.activeModule === "ticketBuilder" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("ticketBuilder")}>Ticket Builder</a>
                </li>
                <li className={props.activeModule === "workflow" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("workflow")}>Workflow</a>
                </li>
                <li className={props.activeModule === "timeline" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("timeline")}>Timeline</a>
                </li>
                <li className={props.activeModule === "invoices" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("invoices")}>Invoices</a>
                </li>
                <li className={props.activeModule === "clockInOut" ? "nav-item active" : "nav-item"}>
                    <a className="nav-link" href="#" onClick={() => toggleMobileNav("clockInOut")}>ClockInOut</a>
                </li>


            </ul>
        </div>
    </nav>)

}

export default Nav;
