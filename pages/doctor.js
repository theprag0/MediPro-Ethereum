import React, {useContext, useState, useCallback} from "react";
import { AuthenticationContext } from "../contexts/auth.contexts";
import { Menu, Icon, Container, Form, Input, Message, Button, Grid } from "semantic-ui-react";
import UploadModal from "../components/UploadModal";
import Link from "next/link";
import Record from "../components/Record";
import ehr from '../ethereum/ehr';
import {create} from 'ipfs-http-client';

function Doctor() {
    const {mainAccount} = useContext(AuthenticationContext);
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

    const INFURA_ID = "2MdNw6HIEDfZbe2luScQn8tw3zK";
    const INFURA_SECRET_KEY = "3c0ce65e22dac309da46a47320841738";
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
                    console.log(records);
                    setRecords(records);
                }
            } catch (err) {
                console.error(err)
            }
            setUploadLoading(false);
        },
        [ehr, mainAccount, newPatient]
    );

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
                </div>
            </Container>
        </section>
    )
}

export default Doctor;