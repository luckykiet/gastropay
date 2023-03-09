import React, { useState } from 'react'
import { Container, Modal } from 'react-bulma-components'
import '../assets/scss/comgate.scss'

const { Card } = Modal;
const { Body } = Card;
export default function ComgateFrame({ paymentMethod, onClose }) {
    const [showModal, setShowModal] = useState(true);

    const handleClose = () => {
        setShowModal(false);
        onClose();
    };

    return (
        <Modal show={showModal} onClose={handleClose}>
            <Card>
                <Body>
                    <Container breakpoint={'fluid'} className='has-text-centered'>
                        <iframe title='comgate-payment' id='comgate-iframe' src={"https://payments.comgate.cz/client/instructions/index?id=" + paymentMethod.transId} />
                    </Container>
                </Body>
            </Card>
        </Modal>
    )
}
