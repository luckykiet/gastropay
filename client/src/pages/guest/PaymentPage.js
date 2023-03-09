import React, { Fragment, useState, useEffect } from 'react';
import { Content, Heading, Container, Box, Table, Button, Block, Form, Icon, Columns } from 'react-bulma-components';
import { useCartItems, useChoosenRestaurant, useTables, useTips } from '../../stores/ZustandStores';
import { Link, useNavigate } from 'react-router-dom';
import { calculateCart, addSlashAfterUrl, createAxios } from '../../utils'
import TipsInput from '../../components/menu/TipsInput';
import LoadingComponent from '../../components/LoadingComponent';
import { Promise } from 'bluebird';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { PATHS } from '../../config/paths';
import { API } from '../../config/api';
import { CONFIG } from '../../config/config';

const { Field, Input, Label, Help, Control, Select } = Form;
const { Column } = Columns;

export default function PaymentPage() {
    const [isPaymentLoading, setIsPaymentLoading] = useState(true);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [postMsg, setPostMsg] = useState({});
    const [selectedTable, setSelectedTable] = useState('');
    const [emailInput, setEmailInput] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [merchantPaymentMethods, setMerchantPaymentMethods] = useState([]);
    const cartItems = useCartItems();
    const tables = useTables();
    const choosenRestaurant = useChoosenRestaurant();
    const tips = useTips();
    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        const { value } = e.target;
        setEmailInput(value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsEmailValid(emailRegex.test(value) || value.length === 0);
    }

    const handleComgateClick = async (e) => {
        e.preventDefault();
        setIsPaymentLoading(true);
        try {
            if (isEmailValid === null || !isEmailValid) {
                throw new Error("Nesprávný email formát");
            }
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));

            const transaction = {
                tips: tips,
                restaurant: choosenRestaurant,
                orders: cartItems,
                paymentGate: 'comgate',
                email: emailInput,
                deliveryMethod: selectedTable
            }

            const { data: { success, msg } } = await axios.post(
                `${API.TRANSACTION}`,
                JSON.stringify(transaction), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!success) {
                throw new Error(msg);
            }

            navigate(PATHS.TRANSACTION + "/" + msg.refId);
        } catch (error) {
            console.log(error)
            setPostMsg({
                success: false,
                msg: error.response?.data?.msg ? error.response.data.msg : error
            });
        } finally {
            setIsPaymentLoading(false);
        }
    }

    useEffect(() => {
        if (Object.keys(choosenRestaurant).length !== 0) {
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
            const fetchTransaction = async () => {
                try {
                    const { data: { success, msg } } = await axios.get(`${API.TRANSACTION}/${API.PAYMENT_METHODS}/${choosenRestaurant._id}`);
                    if (success) {
                        setMerchantPaymentMethods(msg);
                    } else {
                        console.log(msg);
                    }
                } catch (error) {
                    console.log(error.response.data.msg)
                }
            };
            Promise.delay(1000).then(fetchTransaction);
        }
        setIsPageLoading(false);
        setIsPaymentLoading(false);
    }, [choosenRestaurant])

    useEffect(() => {
        if (tables.length > 0) {
            setSelectedTable(tables[0]);
        }
    }, [tables]);

    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Platba</Heading>
            </Content>
            {isPageLoading ? <LoadingComponent /> :
                (
                    Object.keys(cartItems).length === 0 ?
                        <Container className="has-text-centered">
                            <Heading size={5} renderAs='p'>Nemáte co platit. Vraťte se na <Link to={PATHS.RESTAURANTS}>výběr restaurací</Link>.</Heading>
                        </Container>
                        :
                        <Container className="has-text-left is-max-desktop">
                            <Box>
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
                                            {cartItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.name}</td>
                                                    <td>x {item.quantity}</td>
                                                    <td>{item.quantity * parseFloat(item.price)} Kč</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Block>
                                <TipsInput />
                                <Heading size={4} renderAs="p">Celkem: {Math.round(calculateCart(cartItems).totalPrice + tips) + " Kč"}</Heading>
                                <hr />
                                <Block>
                                    <Columns>
                                        <Column>
                                            <Field>
                                                <Label className='is-normal' htmlFor='inputEmail'><span className='has-text-danger'>*</span> Email</Label>
                                                <Control>
                                                    <Field className='has-addons'>
                                                        <Control>
                                                            <Input color={isEmailValid !== null && !isEmailValid && "danger"} value={emailInput} onChange={handleEmailChange} id='inputEmail' type='email' required placeholder='Email pro zasílání účtenky' />
                                                            <Icon color={isEmailValid !== null && !isEmailValid && "danger"} align="left"><FontAwesomeIcon icon={faEnvelope} /></Icon>
                                                            {isEmailValid !== null && !isEmailValid && <Help color="danger">Nesprávný email formát</Help>}
                                                        </Control>
                                                    </Field>
                                                </Control>
                                            </Field>
                                        </Column>
                                        {tables.length > 0 &&
                                            <Column>
                                                <Field>
                                                    <Label className='is-normal' htmlFor='inputTables'><span className='has-text-danger'>*</span> Stůl</Label>
                                                    <Control>
                                                        <Select id='inputTables' onChange={(e) => setSelectedTable(e.target.value)} value={selectedTable} required>
                                                            {tables.map((table) => {
                                                                return (
                                                                    <option value={table} key={table}>{table}</option>
                                                                )
                                                            })}
                                                        </Select>
                                                    </Control>
                                                </Field>
                                            </Column>
                                        }
                                    </Columns>
                                </Block>
                                <hr />
                                <Block>
                                    <Heading renderAs='h3' size={4}>Zvolte si způsob platby</Heading>
                                    {isPaymentLoading
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
                                                                src={addSlashAfterUrl(CONFIG.IMAGE_BASE_URL) + "logo/logo-comgate.png"}
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
                                {postMsg && postMsg.msg && (
                                    <p className={postMsg.success ? "has-text-success" : "has-text-danger"}>
                                        {postMsg.msg instanceof Error ? postMsg.msg.message : typeof postMsg.msg === "string" && postMsg.msg}
                                    </p>
                                )}
                            </Box>
                        </Container>
                )
            }
        </Fragment>
    )
}
