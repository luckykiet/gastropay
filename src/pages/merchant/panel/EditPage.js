import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, API_URL, PATHS, daysOfWeeksCzech } from '../../../utils';
import { Box, Heading, Form, Button, Container, Hero, Block } from "react-bulma-components";
import { Promise } from 'bluebird';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import LoadingComponent from '../../../components/LoadingComponent';
import produce from 'immer';
import moment from 'moment';

const { Body } = Hero;
const { Field, Label, Control, Input } = Form;
export default function EditPage() {
    const idRestaurant = useParams().idRestaurant;
    const [restaurant, setRestaurant] = useState({});
    const [postMsg, setPostMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchRestaurant = async () => {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}/${idRestaurant}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (success) {
                    setRestaurant(msg);
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(0).then(fetchRestaurant);
    }, [idRestaurant]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRestaurant(
            produce((draft) => {
                const keys = name.split(".");
                const lastKey = keys.pop();
                let parent = draft;
                keys.forEach((key) => {
                    parent = parent[key];
                });
                parent[lastKey] = value;
            })
        );
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (restaurant.name === '' || restaurant.address.street === '' || restaurant.address.city === '' || restaurant.address.postalCode === '') {
            setPostMsg("Zkontrolujte vyplněné údaje!");
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(API_URL));
                const { data: { success, msg } } = await axios.put(
                    `api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}/${idRestaurant}`,
                    JSON.stringify(restaurant), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });
                if (success) {
                    console.log(msg);
                    navigate(PATHS.ROUTERS.DASHBOARD + "/" + PATHS.ROUTERS.RESTAURANT_EDIT + "/" + idRestaurant);
                } else {
                    setPostMsg(msg);
                }
            } catch (err) {
                setPostMsg(err.response.data.msg);
            } finally {
                setLoading(false);
            }
        }
    }

    const OpeningTimes = ({ day }) => {
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
                            defaultValue={restaurant.openingTime[day].from ? moment(restaurant.openingTime[day].from, "HH:mm") : moment("00:00", "HH:mm")}
                            showSecond={false}
                            placeholder="Vyberte čas"
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
                            defaultValue={restaurant.openingTime[day].to ? moment(restaurant.openingTime[day].to, "HH:mm") : moment("00:00", "HH:mm")}
                            showSecond={false}
                            placeholder="Vyberte čas"
                        />
                    </Control>
                </Field>
            </Block>
        )
    }

    return (
        <Fragment>{loading ? (
            <LoadingComponent />
        ) :
            (<Fragment><Hero color="link" size="small">
                <Body>
                    <Heading size={4}>{restaurant.name}</Heading>
                </Body>
            </Hero>
                <Container pt={5} breakpoint={'fluid'} style={{ height: "calc(60vh)", overflowY: 'scroll' }}>
                    <Box style={{ margin: 'auto' }}>
                        <form onSubmit={handleSubmit}>
                            <Block>
                                <Heading renderAs='p' size={4} className='has-text-weight-bold is-inline-block'>Profil:</Heading>
                                <div className='is-pulled-right'>
                                    <Heading renderAs='label' htmlFor={'checkBoxIsAvailable'} size={5} mr={4} className='has-text-weight-bold is-inline-block'>Aktivní: </Heading>
                                    <Toggle
                                        id='checkBoxIsAvailable'
                                        name={"isAvailable"}
                                        checked={restaurant.isAvailable}
                                        onChange={(e) => {
                                            handleChange({ target: { name: "isAvailable", value: e.target.checked } });
                                        }}
                                    />
                                </div>
                                <Field>
                                    <Label htmlFor="inputName">
                                        Název
                                    </Label>
                                    <Control>
                                        <Input onChange={handleChange} name={"name"} defaultValue={restaurant?.name} type={"text"} id="inputName" placeholder="Gastro bistro" required />
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputImage">
                                        Obrázek
                                    </Label>
                                    <Control>
                                        <Input onChange={handleChange} name={"image"} defaultValue={restaurant?.image} type={"text"} id="inputImage" placeholder="Image URL" />
                                    </Control>
                                </Field>
                            </Block>
                            <Block>
                                <Heading renderAs='p' size={4} className='has-text-weight-bold'>Adresa:</Heading>
                                <Field>
                                    <Label htmlFor="inputStreet">
                                        Ulice
                                    </Label>
                                    <Control>
                                        <Input onChange={handleChange} name={"address.street"} defaultValue={restaurant.address?.street} type={"text"} id="inputStreet" placeholder="Na Porici 81" required />
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputCity">
                                        Město
                                    </Label>
                                    <Control>
                                        <Input onChange={handleChange} name={"address.city"} defaultValue={restaurant.address?.city} type={"text"} id="inputCity" placeholder="Praha 1" required />
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputPsc">
                                        PSČ
                                    </Label>
                                    <Control>
                                        <Input onChange={handleChange} name={"address.postalCode"} defaultValue={restaurant.address?.postalCode} type={"text"} id="inputPsc" placeholder="11000" required />
                                    </Control>
                                </Field>
                            </Block>
                            <Block>
                                <Heading renderAs='p' size={4} className='has-text-weight-bold'>Menu API:</Heading>
                                <Field>
                                    <Label htmlFor="inputApiBaseUrl">
                                        Base URL
                                    </Label>
                                    <Control>
                                        <Input onChange={handleChange} name={"api.baseUrl"} defaultValue={restaurant.api?.baseUrl} type={"text"} id="inputApiBaseUrl" placeholder="https://api.npoint.io/" />
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputApiParam">
                                        Parametry
                                    </Label>
                                    <Control>
                                        <Input onChange={handleChange} name={"api.params"} defaultValue={restaurant.api?.params} type={"text"} id="inputApiParam" placeholder="API Params" />
                                    </Control>
                                </Field>
                            </Block>
                            <Heading renderAs='p' size={4} className='has-text-weight-bold'>Otevírací doba:</Heading>
                            {Object.keys(restaurant.openingTime).map((key) => {
                                return <OpeningTimes key={key} day={key} />
                            })}
                            <Button submit fullwidth color={'warning'}>Uložit</Button>
                        </form>
                        {postMsg !== '' && <p className="has-text-danger">{postMsg}</p>}
                    </Box>
                </Container>
            </Fragment>)}
        </Fragment>
    )
}
