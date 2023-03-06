import React, {useState} from "react";
import { Modal, Button, Icon } from "semantic-ui-react";
import {DropzoneAreaBase} from 'material-ui-dropzone'
import { Chip } from "@material-ui/core";

function UploadModal({patientExist, patientAddress, handleUpload, isLoading}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [buffer, setBuffer] = useState(null);

    const handleFileChange = fileObj => {
        console.log('here')
        const { file } = fileObj;
        setBuffer(null);
        setFile(file);
        console.log(file)
        console.log('file.name :>> ', file.name);
    
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
          const buffer = Buffer.from(reader.result);
          setBuffer(buffer);
        }
    }

    return (
        <Modal
            onClose={() => setModalOpen(false)}
            onOpen={() => setModalOpen(true)}
            open={modalOpen}
            trigger={
                <Button icon labelPosition="left" primary disabled={!patientExist} style={{backgroundColor: '#3e5641', color: '#fff'}}>
                    <Icon name="cloud upload"/>
                    New Record
                </Button>
            }
        >
            <Modal.Header>Upload new Patient Record</Modal.Header>
            <Modal.Content>
                <DropzoneAreaBase 
                    onAdd={fileObj => handleFileChange(fileObj[0])}
                    onDelete={fileObj => {
                        setFile(null)
                        setBuffer(null)
                    }}
                />
                {
                    file 
                    && <Chip 
                        label={file.name} 
                        onDelete={() => {
                            setFile(null)
                            setBuffer(null)
                        }} 
                        style={{ fontSize: '12px' }} 
                    />
                }
                <Button
                    disabled={!file || !buffer}
                    floated="right"
                    primary
                    style={{margin: '10px'}}
                    onClick={() => handleUpload(buffer, file.name, patientAddress)}
                    loading={isLoading}
                >
                    Upload
                </Button>
            </Modal.Content>
        </Modal>
    )
}

export default UploadModal;