import React from 'react'
import { useCartItems, useDecrementCartItem, useIncrementCartItem, useRemoveCartItem, useSetTips, useTips } from '../../stores/ZustandStores';
import { calculateCart } from '../../utils';
import { Table, Button, Form, Container } from 'react-bulma-components';
import { faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const { Field, Input, Label, Control } = Form;
export default function Cart() {
    const cartItems = useCartItems();
    const [tips, setTips] = [useTips(), useSetTips()];
    const incrementCartItem = useIncrementCartItem();
    const decrementCartItem = useDecrementCartItem();
    const removeCartItem = useRemoveCartItem();
    const tipAdjust = [10, 20, 50];
    const tipPercentageAdjust = [0.05, 0.10, 0.15];

    const handleAdjustTipByPercent = (tip) => {
        const totalPrice = calculateCart(cartItems).totalPrice;
        const newTips = tips + (totalPrice * tip);
        setTips(Math.round(newTips));
    }

    const handleAdjustTip = (tip) => {
        const newTips = tips + tip
        setTips(Math.round(newTips));
    }

    return (
        <Container breakpoint={'fluid'}>
            <Table size={'fullwidth'}>
                <thead>
                    <tr>
                        <th>Název</th>
                        <th>Množství</th>
                        <th colSpan={2}>Cena</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>x {item.quantity}</td>
                            <td>{item.quantity * parseFloat(item.price)} Kč</td>
                            <td><Button onClick={() => incrementCartItem(item.id)} size={'small'} color={'white'}><FontAwesomeIcon icon={faPlus} /></Button><Button onClick={() => decrementCartItem(item.id)} size={'small'} color={'white'}><FontAwesomeIcon icon={faMinus} /></Button><Button onClick={() => removeCartItem(item.id)} size={'small'} color={'white'}><FontAwesomeIcon icon={faTrash} /></Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Field>
                <Control>
                    <Label className='is-normal' mr={5} htmlFor='inputTips'>Tips:</Label>
                    <Field className='has-addons'>
                        <Control>
                            <Input id='inputTips'
                                onFocus={(e) => e.target.select()}
                                required
                                autoFocus
                                value={tips}
                                onChange={(e) => setTips(parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0)}
                                type="number"
                            />
                        </Control>
                        <Control>
                            <Button color={'danger'} onClick={() => setTips(0)}><FontAwesomeIcon icon={faTrash} /></Button>
                        </Control>
                    </Field>
                </Control>
            </Field>
            <Button.Group>
                {tipPercentageAdjust.map((tip) => (
                    <Button key={tip} onClick={() => handleAdjustTipByPercent(tip)} color={'warning'}>+ {(tip * 100)}%</Button>
                ))}
                {tipAdjust.map((tip) => (
                    <Button key={tip} onClick={() => handleAdjustTip(tip)} color={'warning'}>+ {tip}</Button>
                ))}
            </Button.Group>
        </Container>
    );
};