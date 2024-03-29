import React, {useContext, useState, useCallback} from "react";
import { AuthenticationContext } from "../contexts/auth.contexts";
import { Menu, Icon, Container, Form, Input, Message, Button, Grid } from "semantic-ui-react";
import { Snackbar } from "@material-ui/core";
import UploadModal from "../components/UploadModal";
import Link from "next/link";
import Record from "../components/Record";
import ehr from '../ethereum/ehr';
import {create} from 'ipfs-http-client';
// import ehrTemplate from '../assets/pdf/MediPro-EHR-Template.pdf';

function Doctor() {
    const {mainAccount, role} = useContext(AuthenticationContext);
    const [patient, setPatient] = useState('');
    const [newPatient, setNewPatient] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [searchError, setSearchError] = useState('');
    const [patientExist, setPatientExist] = useState(false);
    const [records, setRecords] = useState([]);
    const [currPatient, setCurrPatient] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');

    const INFURA_ID = process.env.INFURA_ID;
    const INFURA_SECRET_KEY = process.env.INFURA_SECRET_KEY;
    const auth = 'Basic ' + Buffer.from(INFURA_ID + ':' + INFURA_SECRET_KEY).toString('base64');

    const ipfs = create(
        {
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https",
            headers: {
                authorization: auth, // infura auth credentails
            }
        }
    )

    const handlePatientInput = evt => {
        setPatient(evt.target.value);
    }

    const handleNewPatientInput = evt => {
        setNewPatient(evt.target.value);
    }

    const registerPatient = async evt => {
        evt.preventDefault();
        setRegisterLoading(true);
        setRegisterError('');
        if(!/^(0x)?[0-9a-f]{40}$/i.test(newPatient)) {
            setRegisterError('Please enter a valid wallet address');
            setRegisterLoading(false);
            return;
        }
        try {
            await ehr.methods.addPatient(newPatient).send({
                from: mainAccount
            });
            setAlertMsg('Patient Registered Successfully!');
            setAlertOpen(true);
        } catch(err) {
            setRegisterError(err.message);
        }
        setRegisterLoading(false);
    }

    const searchPatient = async evt => {
        evt.preventDefault();
        setSearchLoading(true);
        setSearchError('');
        try {
            if (!/^(0x)?[0-9a-f]{40}$/i.test(patient)) {
              setSearchError('Please enter a valid wallet address');
              return;
            }
            const patientExists = await ehr.methods.getPatientExists(patient).call({ from: mainAccount });
            if (patientExists) {
              const records = await ehr.methods.getRecords(patient).call({ from: mainAccount });
              console.log('records :>> ', records);
              setRecords(records);
              setPatientExist(true);
              setCurrPatient(patient);
            } else {
              setSearchError('Patient does not exist');
            }
        } catch (err) {
            setSearchError(err.message);
        }
        setSearchLoading(false);
    }

    const addRecordCallback = useCallback(
        async (buffer, fileName, patientAddress) => {
            setUploadLoading(true);
            if (!patientAddress) {
                setUploadLoading(false);
                return;
            }
            try {
                const res = await ipfs.add(buffer);
                const ipfsHash = res.path;
                if (ipfsHash) {
                    console.log(ipfsHash)
                    console.log(fileName)
                    console.log(patientAddress)
                    await ehr.methods.addRecord(ipfsHash, fileName, patientAddress).send({ from: mainAccount });
            
                    // refresh records
                    const records = await ehr.methods.getRecords(patientAddress).call({ from: mainAccount });
                    setRecords(records);
                    setAlertMsg('Record added successfully!');
                    setAlertOpen(true);
                }
            } catch (err) {
                console.error(err)
            }
            setUploadLoading(false);
        },
        [ehr, mainAccount, newPatient]
    );

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setAlertOpen(false);
    };

    const genContent = () => {
        if(mainAccount && role === 'doctor') {
            return (
                <>
                    <div style={{width: '100%'}}>
                        <h1 className="dashboard-headers">Patient Records</h1>
                        <Form onSubmit={searchPatient} error={!!searchError}>
                            <Grid>
                                <Grid.Row>
                                    <Grid.Column width={12}>
                                        <Input 
                                            placeholder="Search patient by wallet address"
                                            value={patient}
                                            onChange={handlePatientInput}
                                            style={{width: '100%'}}
                                        />
                                    </Grid.Column>
                                    <Grid.Column width={4}>
                                        <Button icon labelPosition="left" style={{backgroundColor: '#3e5641', color: '#fff'}} loading={searchLoading}>
                                            <Icon name="search"/>
                                            Search 
                                        </Button>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Message error header="Oops!" content={searchError}/>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Form>
                        <div>
                            <UploadModal 
                                patientExist={patientExist}
                                handleUpload={addRecordCallback}
                                patientAddress={currPatient}
                                isLoading={uploadLoading}
                            />
                            <Button icon labelPosition="left" primary style={{backgroundColor: '#3e5641', color: '#fff', marginLeft: '20px'}}>
                                <Icon name="download"/>
                                <a href='/pdf/MediPro-EHR-Template.pdf' download style={{color: '#fff'}}>
                                    Download EHR Template
                                </a>
                            </Button>
                        </div>
                        {
                            patientExist
                            ? (
                                <div style={{marginTop: '20px'}}>
                                    <p><strong>Patient Viewing: </strong>{currPatient}</p>
                                    {
                                        records && records.length > 0
                                        ? records.map((record, idx) => (
                                            <Record record={record} key={idx}/>
                                        ))
                                        : <p><em>No Records Found.</em></p>
                                    }
                                </div>
                            ) : null
                        }
                    </div>
                    <hr className="styled-hr"/>
                    <div>
                        <h1 className="dashboard-headers">Register Patient</h1>
                        <Form onSubmit={registerPatient} error={!!registerError}>
                            <Grid>
                                <Grid.Row>
                                    <Grid.Column width={12}>
                                        <Input 
                                            placeholder="Register patient by wallet address"
                                            value={newPatient}
                                            onChange={handleNewPatientInput}
                                            style={{width: '100%'}}
                                        />
                                    </Grid.Column>
                                    <Grid.Column width={4}>
                                        <Button icon labelPosition="left" style={{backgroundColor: '#3e5641', color: '#fff'}} loading={registerLoading}>
                                            <Icon name="user plus"/>
                                            Register
                                        </Button>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column>
                                        <Message error header="Oops!" content={registerError}/>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Form>
                    </div>
                </>
            );
        } else if(mainAccount && (role === 'patient' || role === 'unknown')) {
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
        <section className="Doctor">
            <Container style={{margin: '40px 0'}}>
                <div style={{backgroundColor: 'rgba(255, 255, 255, 0.91)', padding: '2rem', borderRadius: '15px', paddingBottom: '3rem'}}>
                    <Menu>
                        <Link href={'/'}>
                            <a className="brand item">MediPro</a>
                        </Link>
                        <Menu.Menu position="right">
                                <a className="item"><Icon name="user"/> <span>{mainAccount}</span></a>
                        </Menu.Menu>
                    </Menu>
                    {genContent()}
                </div>
            </Container>
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
        </section>
    )
}

export default Doctor;
