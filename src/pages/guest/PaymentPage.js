import React, { Fragment, useState, useEffect } from 'react';
import { Content, Heading, Container, Box, Table, Button, Block } from 'react-bulma-components';
import { useCartItems, useChoosenRestaurant, useTips } from '../../stores/ZustandStores';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS, calculateCart, IMAGE_BASE_URL, addSlashAfterUrl, createAxios, API_URL } from '../../utils'
import TipsInput from '../../components/menu/TipsInput';
import LoadingComponent from '../../components/LoadingComponent';
import { Promise } from 'bluebird';

export default function PaymentPage() {
    const cartItems = useCartItems();
    const choosenRestaurant = useChoosenRestaurant();
    const [postMsg, setPostMsg] = useState({});
    const tips = useTips();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [merchantPaymentMethods, setMerchantPaymentMethods] = useState([]);

    const handleComgateClick = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const axios = createAxios(addSlashAfterUrl(API_URL));

            const transaction = {
                tips: tips,
                restaurant: choosenRestaurant,
                orders: cartItems,
                paymentGate: 'comgate'
            }

            const { data: { success, msg } } = await axios.post(
                `api/${PATHS.API.TRANSACTION}`,
                JSON.stringify(transaction), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (success) {
                navigate(PATHS.ROUTERS.TRANSACTION + "/" + msg.refId);
            } else {
                setPostMsg({
                    success: false,
                    msg: msg
                });
            }
        } catch (error) {
            setPostMsg({
                success: false,
                msg: error.response.data.msg
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (Object.keys(choosenRestaurant).length !== 0) {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            const fetchTransaction = async () => {
                try {
                    const { data: { success, msg } } = await axios.get(`api/${PATHS.API.TRANSACTION}/${PATHS.API.PAYMENT_METHODS}/${choosenRestaurant._id}`);
                    if (success) {
                        setMerchantPaymentMethods(msg);
                    } else {
                        console.log(msg);
                    }
                } catch (error) {
                    console.log(error.response.data.msg)
                } finally {
                    setIsLoading(false);
                }
            };
            Promise.delay(0).then(fetchTransaction);
        }
    }, [choosenRestaurant])


    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Platba</Heading>
            </Content>
            {Object.keys(cartItems).length === 0 ?
                <Container className="has-text-centered">
                    <Heading size={5} renderAs='p'>Nemáte co platit. Vraťte se na <Link to={PATHS.ROUTERS.RESTAURANTS}>výběr restaurací</Link>.</Heading>
                </Container>
                :
                <Container className="has-text-left is-max-desktop">
                    <Box>
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
                                    {cartItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>x {item.quantity}</td>
                                            <td>{item.quantity * parseFloat(item.price)} Kč</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <TipsInput />
                        </Block>
                        <Heading size={4} renderAs="p">Celkem: {Math.round(calculateCart(cartItems).totalPrice + tips) + " Kč"}</Heading>
                        <hr />
                        <Block>
                            <Heading renderAs='h3' size={4}>Zvolte si způsob platby</Heading>
                            {isLoading
                                ?
                                <LoadingComponent />
                                :
                                merchantPaymentMethods.length === 0
                                    ?
                                    <Heading renderAs='p' size={5}>Obchodník nemá nastavenou platební metodu.</Heading>
                                    :
                                    merchantPaymentMethods.map((method) => {
                                        if (method === 'comgate') {
                                            return (
                                                <Button key={method} onClick={handleComgateClick} style={{ position: 'relative', overflow: 'hidden', width: '150px', height: '70px' }}>
                                                    <img
                                                        alt='comgate'
                                                        src={addSlashAfterUrl(IMAGE_BASE_URL) + "logo/logo-comgate.png"}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'fill'
                                                        }}
                                                    />
                                                </Button>
                                            );
                                        } else if (method === 'gopay') {
                                            return <Button key={method} color={'warning'}>GoPay</Button>;
                                        }
                                        return "";
                                    })
                                // add more methods later
                            }
                        </Block>
                        {postMsg && typeof postMsg.msg === "string" && (
                            <p className={postMsg.success ? "has-text-success" : "has-text-danger"}>
                                {postMsg.msg}
                            </p>
                        )}
                    </Box>
                </Container>
            }
        </Fragment>
    )
}
