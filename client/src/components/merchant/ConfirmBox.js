import React, { useState } from 'react';
import { Modal, Button } from 'react-bulma-components';

const { Card } = Modal;
const { Title, Header, Body, Footer } = Card;

export default function ConfirmBox({ message, yesText, noText, title, onConfirm, onCancel }) {
    const [showModal, setShowModal] = useState(true);
    const handleClose = () => {
        setShowModal(false);
        onCancel();
    };

    const handleConfirm = () => {
        setShowModal(false);
        onConfirm();
    };

    return (
        <Modal show={showModal} onClose={handleClose}>
            <Card>
                <Header>
                    <Title>{title}</Title>
                </Header>
                <Body>{message}</Body>
                <Footer>
                    <Button onClick={handleClose}>{noText}</Button>
                    <Button color={"danger"} onClick={handleConfirm}>{yesText}</Button>
                </Footer>
            </Card>
        </Modal>
    );
}

