import React, { Fragment, useState, useEffect } from 'react';
import { Content, Heading, Container, Box, Block, Table, Columns, Button } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, calculateCart, statusColor, paymentGatesName } from '../../utils';
import LoadingComponent from '../../components/LoadingComponent';
// import ComgateFrame from '../../components/ComgateFrame';
import { Promise } from 'bluebird';
import { PATHS } from '../../config/paths';
import { API } from '../../config/api';
import { CONFIG } from '../../config/config';
import moment from 'moment';

const { Column } = Columns;
export default function TransactionPage() {
    const { idTransaction } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState({});
    const [result, setResult] = useState({});
    // const [showPaymentBox, setShowPaymentBox] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // const handlePayClick = (e) => {
    //     e.preventDefault();
    //     const method = Object.keys(paymentMethod)[0];
    //     if (method === 'comgate') {
    //         setShowPaymentBox(true);
    //     }
    // }

    useEffect(() => {
        document.title = `Transakce ${idTransaction} | ${CONFIG.APP_NAME}`;
    }, [idTransaction])

    useEffect(() => {
        const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
        const fetchTransaction = async () => {
            console.log("Checking...")
            try {
                const { data: { success, msg } } = await axios.get(`${API.TRANSACTION}/${idTransaction}`);
                if (!success) {
                    throw new Error("Nečítání transakce selhala!")
                }
                setResult(msg);
                setPaymentMethod(msg.transaction.paymentMethod);
                if (msg.transaction.status === 'CANCELLED' || msg.transaction.status === 'COMPLETED') {
                    setIsCompleted(true);
                }
            } catch (error) {
                console.log(error.response.data.msg)
            } finally {
                setIsLoading(false);
            }
        };
        Promise.delay(0).then(fetchTransaction);
        if (!isCompleted) {
            const interval = setInterval(() => {
                Promise.delay(0).then(fetchTransaction);
            }, 15000);
            return () => clearInterval(interval);
        }
    }, [idTransaction, isCompleted]);

    // useLayoutEffect(() => {
    //     const html = document.documentElement;
    //     if (showPaymentBox) {
    //         html.style.overflow = "hidden";
    //     } else {
    //         html.style.overflow = "unset";
    //     }

    //     return () => {
    //         html.style.overflow = "unset";
    //     };
    // }, [showPaymentBox]);

    const StatusField = () => {
        const status = result.transaction.status;
        if (status === 'PENDING') {
            return (<Fragment>
                <Heading renderAs='h2' className={'has-text-' + statusColor[status]} size={4}>NEZAPLACENO</Heading>
                <Heading renderAs='p' className={'has-text-' + statusColor[status]} size={5}>Nemáte zaplacenou objednávku</Heading>
                <PaymentField />
            </Fragment>)
        } else if (status === 'CANCELLED') {
            return <Heading renderAs='h2' className={'has-text-' + statusColor[status]} size={4}>ZRUŠENO</Heading>
        } else if (status === 'PAID') {
            return !result.transaction.pos.isConfirmed &&
                <Fragment>
                    <Heading renderAs='h2' className={'has-text-' + statusColor[status]} size={4}>ZAPLACENO</Heading>
                    <Heading renderAs='p' className={'has-text-' + statusColor[status]} size={5}>Máte zaplacenou objednávku, počkejte na potvrzení obchodníka.</Heading>
                    <Heading renderAs='span' size={5}>Obchodník: </Heading>
                    <LoadingComponent />
                </Fragment>
        } else {
            return (
                <Fragment>
                    <Heading renderAs='p' size={5}>Obchodník:  <Heading renderAs='span' className={'has-text-success'} size={5}>POTVRZENO</Heading></Heading>
                    {result.transaction.pos.receiptNumber && result.transaction.pos.receiptNumber !== "" && <Heading renderAs='p' size={5}>Číslo účtenky: {result.transaction.pos.receiptNumber}</Heading>}
                    {result.transaction.pos.callingNumber && result.transaction.pos.callingNumber !== "" && <Heading renderAs='p' size={5}>Pořadové číslo: {result.transaction.pos.callingNumber}</Heading>}
                </Fragment>
            )
        }
    }

    const PaymentField = () => {
        const method = Object.keys(paymentMethod)[0];
        if (method === 'comgate') {
            return (
                <Fragment>
                    {/* <Button size={'large'} color={'warning'} onClick={handlePayClick}>Zaplatit</Button>
                    {showPaymentBox && (
                        <ComgateFrame
                            paymentMethod={paymentMethod[method]}
                            onClose={() => setShowPaymentBox(false)}
                        />
                    )} */}

                    <Button size={'large'} color={'warning'} renderAs='a' href={"https://payments.comgate.cz/client/instructions/index?id=" + paymentMethod[method].transId} >Zaplatit</Button>
                </Fragment>
            )
        } else if (method === 'csob') {
            return (
                <Fragment>
                    <Button size={'large'} color={'warning'} renderAs='a' href={paymentMethod[method].url} >Zaplatit</Button>
                </Fragment>
            )
        }
        return ("");
    }

    return (
        <Fragment>
            {isLoading ? (
                <LoadingComponent />
            ) : Object.keys(result).length === 0 ?
                (
                    <Fragment>
                        <Content textAlign={"center"}>
                            <Heading pt={5} spaced>Transakce</Heading>
                        </Content>
                        <Container className="has-text-centered">
                            <Heading size={5} renderAs='p'>Transakce {idTransaction} nenalezena. Vraťte se na <Link to={PATHS.RESTAURANTS}>výběr restaurací</Link>.</Heading>
                        </Container>
                    </Fragment>
                ) : (
                    <Fragment>
                        <Content textAlign={"center"}>
                            <Heading pt={5} spaced>Transakce č. {result.transaction.refId}</Heading>
                        </Content>
                        <Container className="has-text-left is-max-desktop">
                            <Box>
                                <Block>
                                    <Columns>
                                        <Column>
                                            <Heading renderAs='h2' size={4}>{result.restaurant.name}</Heading>
                                            <Heading renderAs='p' className='has-text-weight-normal' size={5}>{result.restaurant.address.street}</Heading>
                                            <Heading renderAs='p' className='has-text-weight-normal' size={5}>{result.restaurant.address.postalCode} {result.restaurant.address.city}</Heading>
                                            <Heading renderAs='h2' size={4}>IČO: {result.merchant.ico}</Heading>
                                            <Heading renderAs='h2' size={4}>Vytvořeno: <span className='has-text-weight-normal'>{moment.utc(result.transaction.createdAt).format("DD/MM/YYYY HH:mm")}</span></Heading>
                                        </Column>
                                        <Column>
                                            <Heading renderAs='h2' size={4}>Email plátce: <span className='has-text-weight-normal'>{result.transaction.email}</span></Heading>
                                            {result.transaction.deliveryMethod.name !== '' && <Heading renderAs='h2' size={4}>Stůl: <span className='has-text-weight-normal'>{result.transaction.deliveryMethod.name}</span></Heading>}
                                            <Heading renderAs='h2' size={4}>Platební metoda: <span className='has-text-weight-normal'>{paymentGatesName[Object.keys(paymentMethod)[0]]}</span></Heading>
                                            <hr />
                                            <Heading renderAs='h2' size={4}>Status</Heading>
                                            <StatusField />
                                        </Column>
                                    </Columns>
                                </Block>
                                <hr />
                                <Heading renderAs='h2' size={4}>Účtenka</Heading>
                                <Block style={{ overflow: "auto" }}>
                                    <Table size={'fullwidth'}>
                                        <thead className='is-size-4'>
                                            <tr>
                                                <th>Název</th>
                                                <th>Množství</th>
                                                <th colSpan={2}>Cena</th>
                                            </tr>
                                        </thead>
                                        <tbody className='is-size-5'>
                                            {result.transaction.cart.orders.map((item) => (
                                                <tr key={item.ean}>
                                                    <td>{item.name}</td>
                                                    <td>x {item.quantity}</td>
                                                    <td>{item.quantity * parseFloat(item.price)} Kč</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <hr />
                                    <Heading size={5} renderAs="p">Spropitné: {result.transaction.tips} Kč</Heading>
                                </Block>
                                <hr />
                                <Heading size={4} renderAs="p">Celkem: {Math.round(calculateCart(result.transaction.cart.orders).totalPrice + result.transaction.tips) + " Kč"}</Heading>
                            </Box>
                        </Container>
                    </Fragment>
                )
            }
        </Fragment>
    )
}
