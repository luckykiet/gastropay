import React, { Fragment } from 'react';
import { Content, Heading, Container, Box, Table, Button, Block } from 'react-bulma-components';
import { useCartItems, useTips } from '../../stores/ZustandStores';
import { Link } from 'react-router-dom';
import { PATHS, calculateCart, IMAGE_BASE_URL, addSlashAfterUrl } from '../../utils'
import TipsInput from '../../components/menu/TipsInput';
export default function PaymentPage() {
    const cartItems = useCartItems();
    const tips = useTips();

    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Platba</Heading>
            </Content>
            <Container className="has-text-left is-max-desktop">
                {Object.keys(cartItems).length === 0 ?
                    <Heading size={5} renderAs='p'>Nemáte co platit. Vraťte se na <Link to={PATHS.ROUTERS.RESTAURANTS}>výběr restaurací</Link>.</Heading>
                    :
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
                            <Button style={{ position: 'relative', overflow: 'hidden', width: '150px', height: '70px' }}>
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
                        </Block>
                    </Box>
                }
            </Container>
        </Fragment>
    )
}
