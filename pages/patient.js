import React, { useState, useEffect, useContext } from 'react';
import { Container, Menu, Icon } from 'semantic-ui-react';
import { AuthenticationContext } from '../contexts/auth.contexts';
import Record from '../components/Record';
import Link from 'next/link';
import ehr from '../ethereum/ehr';

function Patient() {
    const {mainAccount, role} = useContext(AuthenticationContext);

    const [records, setRecords] = useState([]);

    useEffect(() => {
        async function fetchData() {
            if(mainAccount) {
                console.log(mainAccount)
                const records = await ehr.methods.getRecords(mainAccount).call({from: mainAccount});
                setRecords(records);
            }
        }
        fetchData();
    }, []);

    const genContent = () => {
        if(mainAccount && role === 'patient') {
            return (
                <>
                    <h1 className='dashboard-headers' style={{fontSize: '25px'}}>My Records</h1>
                    {
                        records && records.length > 0
                        ? records.map((record, idx) => (
                            <Record record={record} key={idx}/>
                        ))
                        : <p><em>You don't have any doctor visits yet. No Health Records Found.</em></p>
                    }
                </>
            );
        } else if(mainAccount && (role === 'doctor' || role === 'unknown')) {
            return (
                <div className="warning">
                    <h1>You are not authorized to visit this page.</h1>
                    <Link href="/">
                        <a>Go Home</a>
                    </Link>
                </div>
            );
        } else if(!mainAccount) {
            return (
                <div className="warning">
                    <h1>Install the MetaMask extension to continue.</h1>
                    <Link href="/">
                        <a>Go Home</a>
                    </Link>
                </div>
            );
        }
    }

    return (
        <section className='Patient'>
            <Container style={{margin: '40px 0'}}>
                <div style={{backgroundColor: 'rgba(255, 255, 255, 0.91)', padding: '2rem', borderRadius: '15px', paddingBottom: '3rem'}}>
                    <Menu>
                        <Link href={'/'}>
                            <a className="brand item">MediPro</a>
                        </Link>
                        <Menu.Menu position="right">
                                <a className="item"><Icon name="user"/> <span>{mainAccount}</span> <span className='role-label'>{role}</span></a>
                        </Menu.Menu>
                    </Menu>
                    {genContent()}
                </div>
            </Container>
        </section>
    );
}

export default Patient;