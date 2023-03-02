import React, { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, API_URL, PATHS, calculateCart } from '../../../utils';
import { Box, Heading, Container, Hero, Tabs, Table } from "react-bulma-components";
import { Promise } from 'bluebird';
import 'rc-time-picker/assets/index.css';
import "react-toggle/style.css";
import LoadingComponent from '../../../components/LoadingComponent';
import { useChoosenRestaurant } from '../../../stores/MerchantStores';
import moment from 'moment';

const { Body } = Hero;
const { Tab } = Tabs;
export default function TransactionPanelPage() {
    const idRestaurant = useParams().idRestaurant;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const choosenRestaurant = useChoosenRestaurant();
    useEffect(() => {
        setLoading(true);
        const fetchTransactions = async () => {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}/${PATHS.API.TRANSACTION}/${idRestaurant}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (success) {
                    console.log(msg)
                    setTransactions(msg);
                }
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
            Object.keys(transactions).length === 0 ?
                (
                    <Fragment>
                        <Heading renderAs='p' size={5} className='has-text-weight-bold'>Chyba načítání transakcí, obnovte stránku</Heading>
                    </Fragment>
                )
                :
                (
                    <Fragment>
                        <Hero color="link" size="small">
                            <Body>
                                <Heading size={4} className='is-inline-block'>{choosenRestaurant.name}</Heading>
                            </Body>
                        </Hero>
                        <Container py={5} breakpoint={'fluid'}>
                            <Tabs size={'large'}>
                                <Tab onClick={() => navigate(PATHS.ROUTERS.MERCHANT + "/" + PATHS.ROUTERS.RESTAURANT_EDIT + "/" + idRestaurant)}>
                                    Edit
                                </Tab>
                                <Tab active>
                                    Transakce
                                </Tab>
                            </Tabs>
                            <Box style={{ overflow: "auto" }}>
                                <Table size={'fullwidth'}>
                                    <thead className='is-size-4'>
                                        <tr>
                                            <th>ID</th>
                                            <th>Status</th>
                                            <th>Cena</th>
                                            <th>Tips</th>
                                            <th>Platební metoda</th>
                                            <th>Datum</th>
                                        </tr>
                                    </thead>
                                    <tbody className='is-size-5'>
                                        {transactions.map((item) => {
                                            const paymentMethod = Object.keys(item.paymentMethod)[0];
                                            return (
                                                <tr key={item.refId}>
                                                    <td><Link to={PATHS.ROUTERS.TRANSACTION + '/' + item.refId} target="_blank">{item.refId}</Link></td>
                                                    <td>{item.status}</td>
                                                    <td>{calculateCart(item.cart.orders).totalPrice} Kč</td>
                                                    <td>{item.tips} Kč</td>
                                                    <td>{paymentMethod}: {item.paymentMethod[paymentMethod].transId} - {item.paymentMethod[paymentMethod].status} </td>
                                                    <td>{moment.utc(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </Box>
                        </Container>
                    </Fragment>)
        )
        }</Fragment>
    )
}
