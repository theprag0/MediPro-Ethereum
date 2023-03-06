import React from "react";
import { Card, Grid, Icon } from "semantic-ui-react";
import moment from "moment/moment";

function Record({record}) {
    const [cid, name, patientId, doctorId, timestamp] = record

    return (
        <Card fluid>
            <Card.Content>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={2}>
                            <h1 className="record-label"></h1>
                            <Icon name="file alternate" style={{fontSize: '20px'}}/>
                        </Grid.Column>
                        <Grid.Column width={4}>
                            <h1 className="record-label">Record Name</h1>
                            <h1 className="record-text">{name}</h1>
                        </Grid.Column>
                        <Grid.Column width={4}>
                            <h1 className="record-label">Doctor</h1>
                            <h1 className="record-text">{doctorId}</h1>
                        </Grid.Column>
                        <Grid.Column width={4}>
                            <h1 className="record-label">Created Time</h1>
                            <h1 className="record-text">{moment.unix(timestamp).format('MM-DD-YYYY HH:mm')}</h1>
                        </Grid.Column>
                        <Grid.Column width={2}>
                            <h1 className="record-label"></h1>
                            <Icon name="cloud download" style={{fontSize: '20px', cursor: 'pointer'}}/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Card.Content>
        </Card>
    );
}

export default Record;