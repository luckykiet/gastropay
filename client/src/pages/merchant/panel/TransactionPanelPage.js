import React, { Fragment, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, calculateCart, statusColor, paymentGatesName } from '../../../utils';
import { Box, Heading, Container, Hero, Table } from "react-bulma-components";
import { Promise } from 'bluebird';
import 'rc-time-picker/assets/index.css';
import "react-toggle/style.css";
import LoadingComponent from '../../../components/LoadingComponent';
import { useChosenRestaurant } from '../../../stores/MerchantStores';
import moment from 'moment';
import { PATHS } from '../../../config/paths';
import { API } from '../../../config/api';
import { CONFIG } from '../../../config/config';
import { CSOB } from '../../../config/csob';

const { Body } = Hero;
export default function TransactionPanelPage() {
    const { idRestaurant } = useParams();
    const [transactions, setTransactions] = useState(null);
    const [loading, setLoading] = useState(true);
    const chosenRestaurant = useChosenRestaurant();

    useEffect(() => {
        document.title = `Transakce - ${chosenRestaurant.name} | ${CONFIG.APP_NAME}`;
    }, [chosenRestaurant.name])

    useEffect(() => {
        setLoading(true);
        const fetchTransactions = async () => {
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`${API.MERCHANT}/${API.RESTAURANT}/${API.TRANSACTION}/${idRestaurant}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })

                if (!success) {
                    throw new Error(msg);
                }
                setTransactions(msg);
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(0).then(fetchTransactions);
    }, [setTransactions, idRestaurant]);


    return (
        <Fragment>{loading ? (
            <LoadingComponent />
        ) : (
            Object.keys(transactions).length === null ?
                (
                    <Container py={5} breakpoint={'fluid'}>
                        <Heading renderAs='p' size={5} className='has-text-weight-bold'>Chyba načítání transakcí, obnovte stránku</Heading>
                    </Container>
                )
                :
                (
                    <Fragment>
                        <Hero color="link" size="small">
                            <Body>
                                <Heading size={4} className='is-inline-block'>{chosenRestaurant.name}</Heading>
                            </Body>
                        </Hero>
                        <Container py={5} breakpoint={'fluid'}>
                            {Object.keys(transactions).length === 0
                                ?
                                <Heading renderAs='p' size={5} className='has-text-weight-bold'>Nemáte ještě žádnou transakci.</Heading>
                                :
                                <Box style={{ overflowX: "auto" }}>
                                    <Table size={'fullwidth'}>
                                        <thead className='is-size-4'>
                                            <tr>
                                                <th>ID</th>
                                                <th>Status</th>
                                                <th>Cena</th>
                                                <th>Tips</th>
                                                <th>Platební metoda</th>
                                                <th>ID Platby</th>
                                                <th>Status platby</th>
                                                <th>Datum</th>
                                            </tr>
                                        </thead>
                                        <tbody className='is-size-5'>
                                            {transactions.map((item) => {
                                                const paymentMethod = Object.keys(item.paymentMethod)[0];
                                                return (
                                                    <tr key={item.refId}>
                                                        <td><Link to={PATHS.TRANSACTION + '/' + item.refId} target="_blank">{item.refId}</Link></td>
                                                        <td><span className={'has-text-' + statusColor[item.status]}>{item.status}</span></td>
                                                        <td>{calculateCart(item.cart.orders).totalPrice} Kč</td>
                                                        <td>{item.tips} Kč</td>
                                                        <td>{paymentGatesName[paymentMethod]}</td>
                                                        <td>{paymentMethod === 'csob' ? item.paymentMethod[paymentMethod].payId : item.paymentMethod[paymentMethod].transId}</td>
                                                        <td>{paymentMethod === 'csob' ? CSOB.MICROSTATE[item.paymentMethod[paymentMethod].status] : item.paymentMethod[paymentMethod].status}</td>
                                                        <td>{moment.utc(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </Box>}
                        </Container>
                    </Fragment>)
        )
        }</Fragment>
    )
}
