import React, { createContext, useState, useEffect } from "react";
import ehr from '../ethereum/ehr';
import web3 from "../ethereum/web3";

export const AuthenticationContext = createContext();

export function AuthenticationProvider(props) {
    const [role, setRole] = useState('');
    const [mainAccount, setMainAccount] = useState('');

    useEffect(() => {
        async function fetchData() {
            const accounts = await web3.eth.getAccounts();
            let returnedRole = await ehr.methods.getSenderRole().call({
                from: accounts[0]
            });
            setRole(returnedRole);
            setMainAccount(accounts[0]);
        }
        fetchData();
    });

    const payload = {role, mainAccount};

    return (
        <AuthenticationContext.Provider value={payload}>
            {props.children}
        </AuthenticationContext.Provider>
    );
}