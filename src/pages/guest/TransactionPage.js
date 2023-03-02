import React, { Fragment, useState, useEffect } from 'react';
import { Content, Heading, Container, Box, Block, Table, Columns, Button } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, API_URL, PATHS, calculateCart } from '../../utils';
import { Promise } from 'bluebird';
import LoadingComponent from '../../components/LoadingComponent';
import ComgateFrame from '../../components/ComgateFrame';
const { Column } = Columns;
export default function TransactionPage() {
    const { idTransaction } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState({});
    const [result, setResult] = useState({});
    const [showPaymentBox, setShowPaymentBox] = useState(false);

    const checkStatus = () => {

        console.log("checking")
    }

    const handlePaymentBoxClose = () => {
        setShowPaymentBox(false);
        checkStatus();
    }

    const handlePayClick = (e) => {
        e.preventDefault();
        if (Object.keys(paymentMethod)[0] === 'comgate') {
            setShowPaymentBox(true);
        }
    }

    useEffect(() => {
        const axios = createAxios(addSlashAfterUrl(API_URL));
        const fetchTransaction = async () => {
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.TRANSACTION}/${idTransaction}`);
                if (success) {
                    setResult(msg);
                    setPaymentMethod(msg.transaction.paymentMethod);
                    console.log(msg.transaction.paymentMethod)
                    console.log(msg)
                } else {
                    console.log(msg);
                }
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false);
            }
        };
        Promise.delay(300).then(fetchTransaction);
    }, [idTransaction]);

    return (
        <Fragment>
            {isLoading ? (
                <LoadingComponent />
            ) : Object.keys(result) === 0 ?
                (
                    <Fragment>
                        <Content textAlign={"center"}>
                            <Heading pt={5} spaced>Transakce</Heading>
                        </Content>
                        <Container className="has-text-centered">
                            <Heading size={5} renderAs='p'>Transakce {idTransaction} nenalezena. Vraťte se na <Link to={PATHS.ROUTERS.RESTAURANTS}>výběr restaurací</Link>.</Heading>
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
                                        </Column>
                                        <Column>
                                            <Heading renderAs='h2' size={4}>Status</Heading>
                                            {result.transaction.status === 'PENDING'
                                                ?
                                                (paymentMethod[Object.keys(paymentMethod)[0]].status === 'PENDING' &&
                                                    <Fragment>
                                                        <Heading renderAs='p' className={'has-text-danger'} size={5}>Nemáte zaplacenou objednávku</Heading>
                                                        <Button color={'warning'} onClick={handlePayClick}>Zaplatit</Button>
                                                        {Object.keys(paymentMethod)[0] === 'comgate' ?
                                                            (showPaymentBox && (
                                                                <ComgateFrame
                                                                    paymentMethod={paymentMethod['comgate']}
                                                                    onClose={handlePaymentBoxClose}
                                                                />
                                                            ))
                                                            : ""}
                                                    </Fragment>
                                                )
                                                :
                                                (result.transaction.status === 'CANCELLED'
                                                    ?
                                                    <Heading renderAs='h2' className={'has-text-danger'} size={4}>ZRUŠENA</Heading>
                                                    :
                                                    (result.transaction.status === 'PAID'
                                                        ?
                                                        <Heading renderAs='h2' className={'has-text-warning-dark'} size={4}>Objednávka zaplacena</Heading>
                                                        :
                                                        <Heading renderAs='h2' className={'has-text-success'} size={4}>DOKONČENA</Heading>)
                                                )
                                            }
                                        </Column>
                                    </Columns>
                                </Block>
                                <hr />
                                <Block>
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
                                    <Heading size={5} renderAs="p">Tips: {result.transaction.tips} Kč</Heading>
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
