import { useEffect, useState } from 'react'
import { Columns, Content, Heading, Section } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, paths } from "../../utils";
import { Promise } from "bluebird";

export default function RestaurantPage() {
    const [business, setBusiness] = useState([]);
    const { idRestaurant } = useParams();
    const IMAGE_BASE_URL = "http://localhost:3000";

    const czechDays = {
        "monday": "Pondělí",
        "tuesday": "Úterý",
        "wednesday": "Středa",
        "thursday": "Čtvrtek",
        "friday": "Pátek",
        "saturday": "Sobota",
        "sunday": "Neděle"
    }

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
                        <Heading pt={5} spaced>Restaurace: {idRestaurant}</Heading>
                    </Content>
                    <Section>
                        <Columns>
                            <Columns.Column>
                                <Content>
                                    <p>Otevírací doba:</p>
                                    <ul>
                                        {Object.keys(czechDays).map((item) => {
                                            return <li key={item}>{czechDays[item]}: {business.openingTime[item] ? business.openingTime[item].from + "-" + business.openingTime[item].to : "Zavřeno"}</li>;
                                        })}
                                    </ul>
                                </Content>
                            </Columns.Column>
                            <Columns.Column>

                            </Columns.Column>
                        </Columns>
                    </Section>
                </>
            }
        </>
    )
}
