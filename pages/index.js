import React, {useContext, useState} from "react";
import { Button, Icon, Message, Container } from "semantic-ui-react";
import { AuthenticationContext } from "../contexts/auth.contexts";
import { useRouter } from "next/router";
import ehr from '../ethereum/ehr';
import web3 from "../ethereum/web3";

function Home() {
    const {role} = useContext(AuthenticationContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    
    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            const accounts = await web3.eth.getAccounts();
            await ehr.methods.addDoctor().send({
                from: accounts[0]
            });
            router.replace('/');
        } catch(err) {
            setError(err.message);
        }
        setLoading(false);
    }

    const returnContent = () => {
        if(role === 'unknown') {
            return (
                <>
                    <Button icon labelPosition="right" size="medium" onClick={handleRegister} loading={loading} style={{backgroundColor: '#a24936', color: '#fff'}}>
                        Register Doctor <Icon name="add"/>
                    </Button>
                    {error !== '' ? <Message header="Oops!" content={error}/> : null}
                    <p className="note">Note: Contact your doctor to be added into our system</p>
                </>
            );
        } else if(role === 'doctor') {
            return (
                <>
                    <Button icon labelPosition="right" size="medium" style={{backgroundColor: '#a24936', color: '#fff'}} onClick={() => router.push('/doctor')}>
                        Doctor Portal <Icon name="add"/>
                    </Button>
                    <p className="note">Note: Contact your doctor to be added into our system</p>
                </>
            );
        } else if(role === 'patient') {
            return (
                <>
                    <Button icon labelPosition="right" size="medium" style={{backgroundColor: '#a24936', color: '#fff'}}>
                        Patient Portal <Icon name="add"/>
                    </Button>
                </>
            );
        }
    }

    return (
        <main className="Home">
            <div>
                <h1>Welcome to MediPro</h1>
                {returnContent()}
            </div>
        </main>
    )
}

export default Home;