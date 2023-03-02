import React from 'react'
import { daysOfWeeksCzech } from '../../utils';
import { Block, Heading, Form } from 'react-bulma-components';
import Toggle from 'react-toggle';
import TimePicker from 'rc-time-picker';
import moment from 'moment';
import produce from 'immer';
const { Field, Label, Control } = Form;
export default function OpeningTimeInputs({ day, handleChange, restaurant, setRestaurant }) {
    return (
        <Block>
            <Heading renderAs='p' size={5} className='has-text-weight-bold is-inline-block'>{daysOfWeeksCzech[day].name}:</Heading>
            <div className='is-pulled-right'>
                <Heading renderAs='label' htmlFor={'checkBox' + day + 'IsOpen'} size={5} mr={4} className='has-text-weight-bold is-inline-block'>Otevřeno: </Heading>
                <Toggle
                    id={'checkBox' + day + 'IsOpen'}
                    name={"openingTime." + day + ".isOpen"}
                    checked={restaurant.openingTime[day].isOpen}
                    onChange={(e) => {
                        handleChange({ target: { name: "openingTime." + day + ".isOpen", value: e.target.checked } });
                    }}
                />
            </div>
            <br />
            <Field className='is-inline-block' mr={5}>
                <Label htmlFor={"input" + day + "From"}>
                    Od
                </Label>
                <Control>
                    <TimePicker
                        onChange={(time) => {
                            setRestaurant(produce((draft) => {
                                draft.openingTime[day].from = moment(time).format("HH:mm");;
                            }));
                        }}
                        name={"openingTime." + day + ".from"}
                        minuteStep={5}
                        id={"input" + day + "From"}
                        format={'HH:mm'}
                        value={restaurant.openingTime[day].from ? moment(restaurant.openingTime[day].from, "HH:mm") : moment("00:00", "HH:mm")}
                        showSecond={false}
                        placeholder="Vyberte čas"
                        allowEmpty={false}
                        disabled={!restaurant.openingTime[day].isOpen}
                    />
                </Control>
            </Field>

            <Field className='is-inline-block'>
                <Label htmlFor={"input" + day + "To"}>
                    Do
                </Label>
                <Control>
                    <TimePicker
                        onChange={(time) => {
                            setRestaurant(produce((draft) => {
                                draft.openingTime[day].to = moment(time).format("HH:mm");
                            }));
                        }}
                        name={"openingTime." + day + ".to"}
                        minuteStep={5}
                        id={"input" + day + "To"}
                        format={'HH:mm'}
                        value={restaurant.openingTime[day].to ? moment(restaurant.openingTime[day].to, "HH:mm") : moment("00:00", "HH:mm")}
                        showSecond={false}
                        placeholder="Vyberte čas"
                        allowEmpty={false}
                        disabled={!restaurant.openingTime[day].isOpen}
                    />
                </Control>
            </Field>
        </Block>
    )
}