import React from 'react'
import { calculateCart } from '../../utils';
import { useCartItems, useSetTips, useTips } from '../../stores/ZustandStores';
import { Block, Button, Form } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
const { Group } = Button;
const { Field, Input, Label, Control } = Form;
export default function TipsInput() {
    const cartItems = useCartItems();
    const tipAdjust = [10, 20, 50];
    const tipPercentageAdjust = [0.05, 0.10, 0.15];
    const [tips, setTips] = [useTips(), useSetTips()];

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
        <Block>
            <Field>
                <Control>
                    <Label className='is-normal' mr={5} htmlFor='inputTips'>Spropitné:</Label>
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
            <Group>
                {tipPercentageAdjust.map((tip) => (
                    <Button key={tip} onClick={() => handleAdjustTipByPercent(tip)} color={'warning'}>+ {(tip * 100)}%</Button>
                ))}
                {tipAdjust.map((tip) => (
                    <Button key={tip} onClick={() => handleAdjustTip(tip)} color={'warning'}>+ {tip}</Button>
                ))}
            </Group>
        </Block>
    )
}
