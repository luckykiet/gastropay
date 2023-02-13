import { useEffect, useState } from 'react'
import { Columns, Content, Heading, Image } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, paths, BASE_URL, isOpening } from "../../utils";
import { Promise } from "bluebird";
import moment from 'moment';
import { daysOfWeeksCzech } from "../../utils";

export default function RestaurantPage() {
    const [business, setBusiness] = useState([]);
    const { idRestaurant } = useParams();
    const IMAGE_BASE_URL = "http://localhost:3000";
    const todayDay = moment().day();

    useEffect(() => {
        //get from db then api
        const axios = createAxios("http://localhost:3000/");
        Promise.delay(0).then(() => {
            return axios.get('/database/restaurant/' + idRestaurant + '.json');
        }).then((resp) => {
            if (!resp.data) {
                throw resp.data;
            }
            setBusiness(resp.data);
        }).catch((err) => {
            console.log(err);
        });
    }, [idRestaurant]);

    return (
        <>
            {business.length === 0
                ?
                <Content textAlign={"center"}>
                    <Heading pt={5} spaced>Výskytla se chyba</Heading>
                    <p>Vraťte se na <Link to={paths.RESTAURANTS}>výběr restaurací.</Link></p>
                </Content>
                :
                <>
                    <Content textAlign={'center'}>
                        <Heading pt={5} spaced>{business.name}</Heading>
                    </Content>
                    <Columns>
                        <Columns.Column>
                            <Image size={"3by2"} alt={business.name} src={business.image ? IMAGE_BASE_URL + business.image : BASE_URL + "/images/restaurants/default.jpg"}></Image>
                        </Columns.Column>
                        <Columns.Column>
                            <Content>
                                <p className='has-text-weight-bold is-size-4'>Otevírací doba:</p>
                                <ul>
                                    {Object.keys(daysOfWeeksCzech).map((item, index) => {
                                        return <li className={index === todayDay ? " has-text-weight-bold" : undefined} key={item}><span className={'alignAfterColon'}>{daysOfWeeksCzech[item].name}: </span>{business.openingTime[item] ? <span className={(index === todayDay) && isOpening(business.openingTime[item].from, business.openingTime[item].to) ? "has-text-success" : undefined}>{business.openingTime[item].from + " - " + business.openingTime[item].to}</span> : <span className='has-text-danger'>Zavřeno</span>}</li>;
                                    })}
                                </ul>
                            </Content>
                        </Columns.Column>
                    </Columns>
                </>
            }
        </>
    )
}
