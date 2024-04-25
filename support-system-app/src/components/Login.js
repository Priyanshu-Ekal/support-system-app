import React, { useState } from "react";
import Validate from "./Validate.js";


const Login = (props) => {


    const onHandleChange = (e) => {
        if (document.querySelector("button.ckValidate.hide")) {
            document.querySelector("button.ckValidate").classList.remove("hide");
        }

        if (props.newUser === false) {
            Validate(["email", "password"]);
        } else {
            Validate(["email", "password1", "password2"]);
        }

    }

    const ckNewPassword = () => {
        localStorage.setItem("email", document.querySelector("input[name='email']").value.toLowerCase());
        localStorage.setItem("password", document.querySelector("input[name='password2']").value);
        onHandleChange();

        let pass1 = "";
        if (document.querySelector("input[name='password1']")) {
            pass1 = document.querySelector("input[name='password1']").value;
        }

        let pass2 = "";
        if (document.querySelector("input[name='password2']").value) {
            pass2 = document.querySelector("input[name='password2']").value;
        }

        if (pass1 === pass2) {
            document.querySelector("button[name='newUser']").classList.remove("hide");
            document.querySelector("input[name='password2']").classList.remove("error");
        } else {
            document.querySelector("button[name='newUser']").classList.add("hide");
            document.querySelector("input[name='password2']").classList.add("error");

        }
    }



    return (<div className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    {props.newUser === false ?
                        <React.Fragment>
                            <div className="px-12 py-8">
                            <h2 className="flex justify-center mx-auto text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Login</h2><br />
                            <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="email" placeholder="Email" maxLength="75" onChange={onHandleChange} /><br />
                            <input type="password" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="password" placeholder="Password" maxLength="75" onChange={onHandleChange} /><br />
                            <button type="button" className="px-2 py-2 bg-primary text-white border border-gray-300" onClick={() => props.login()}>Login</button><br/>
                            <i><a href="#" className="text-align-center font-medium text-primary-600 hover:underline dark:text-primary-500" onClick={() => props.setNewUser((newUser) => true)}>Create New Account</a></i><br />
                            </div>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <div className="px-6 py-8 items-center">
                            <h2 className="items-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Create Account</h2><br/>

                            <div className="flex justify-center">
                            <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="email" placeholder="Email" maxLength="75" onChange={onHandleChange} />
                            <select className="form-control" name="level">
                                <option className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  value="employee">Employee</option>
                                <option className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  value="manager">Manager</option>
                            </select>
                            </div><br/>
                            <input type="password" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="password1" placeholder="Password" maxLength="75" onChange={ckNewPassword} /><br/>
                            <input type="password" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="password2" placeholder="Retype Password" maxLength="75" onChange={ckNewPassword} /><br/>

                            <button className="px-2 py-2 bg-primary text-white border border-gray-300" name="newUser" onClick={() => props.createUser()}>Create User</button><br/>

                            <i><a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500" onClick={() => props.setNewUser((newUser) => false)}>Already have an account</a></i>
                            </div>
                        </React.Fragment>}
                </div>
            </div>
        </div>
    </div>)

}

export default Login;