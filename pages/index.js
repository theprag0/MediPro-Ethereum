import React, {useContext, useState} from "react";
import { Button, Icon, Message, Container, Menu } from "semantic-ui-react";
import { Snackbar } from "@material-ui/core";
import { AuthenticationContext } from "../contexts/auth.contexts";
import { useRouter } from "next/router";
import ehr from '../ethereum/ehr';
import web3 from "../ethereum/web3";

function Home() {
    const {role, mainAccount} = useContext(AuthenticationContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');
    const router = useRouter();
    
    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            const accounts = await web3.eth.getAccounts();
            await ehr.methods.addDoctor().send({
                from: accounts[0]
            });
            setAlertMsg('Doctor Registered Successfully!');
            setAlertOpen(true);
            router.replace('/');
        } catch(err) {
            setError(err.message);
        }
        setLoading(false);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setAlertOpen(false);
    };

    const returnContent = () => {
        if(mainAccount && role === 'unknown') {
            return (
                <>
                    <Button icon labelPosition="right" size="medium" onClick={handleRegister} loading={loading} style={{backgroundColor: '#a24936', color: '#fff'}}>
                        Register Doctor <Icon name="add"/>
                    </Button>
                    {error !== '' ? <Message header="Oops!" content={error}/> : null}
                    <p className="note">Note: Contact your doctor to be added into our system</p>
                </>
            );
        } else if(mainAccount && role === 'doctor') {
            return (
                <>
                    <Button icon labelPosition="right" size="medium" style={{backgroundColor: '#a24936', color: '#fff'}} onClick={() => router.push('/doctor')}>
                        Doctor Portal <Icon name="add"/>
                    </Button>
                    <p className="note">Note: Contact your doctor to be added into our system</p>
                </>
            );
        } else if(mainAccount && role === 'patient') {
            return (
                <>
                    <Button icon labelPosition="right" size="medium" style={{backgroundColor: '#a24936', color: '#fff'}} onClick={() => router.push('/patient')}>
                        Patient Portal <Icon name="add"/>
                    </Button>
                </>
            );
        } else if(!mainAccount) {
            return (
                <>
                    <p className="note">Install the MetaMask Browser Extension to continue</p>
                    <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" target="_blank">
                        <Button icon labelPosition="right" size="large" style={{backgroundColor: '#fbbf12', color: '#fff'}}>
                                <Icon name="chrome"/>
                                Install MetaMask for Chrome
                        </Button>
                    </a>
                    <a href="https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm" target="_blank">
                        <Button icon labelPosition="right" size="large" style={{backgroundColor: '#007bf2', color: '#fff'}}>
                                <Icon name="edge"/>
                                Install MetaMask for Edge
                        </Button>
                    </a>
                </>
            );
        } 
    }

    return (
        <main className="Home">
            <div>
                <h1>Welcome to <span>MediPro</span></h1>
                <h2>The Decentralized Health Record Experience</h2>
                {returnContent()}
            </div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleClose}
                message={alertMsg}
            />
        </main>
    )
}

export default Home;