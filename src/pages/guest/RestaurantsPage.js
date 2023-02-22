import React, { Fragment, useEffect, useState } from "react";
import { Button, Container, Content as TextContent, Heading, Columns, Form } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { API_URL, createAxios, addSlashAfterUrl } from "../../utils";
import { Promise } from "bluebird";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ } from '@fortawesome/free-solid-svg-icons';
import RestaurantCard from "../../components/restaurants/RestaurantCard";


const { Select } = Form;

const sortableFields = [
    {
        "name": "názvu",
        "value": "name",
    },
    {
        "name": "města",
        "value": "address.city"
    }
];

const SelectItems = () => {
    return sortableFields.map((item) => (
        <option key={item.value} value={item.value}>
            {item.name}
        </option>
    ));
}

export default function RestaurantsPage() {
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [sortField, setSortField] = useState({ value: sortableFields[0]?.value ? sortableFields[0].value : "" });
    const [sortOrder, setSortOrder] = useState('asc');
    const navigate = useNavigate();

    const handleSelectChange = (event) => {
        setSortField({ value: event.target.value });
        setLoading(true);
    }

    const handleSortOrderClick = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setLoading(true);
    }

    useEffect(() => {
        const axios = createAxios(addSlashAfterUrl(API_URL));
        Promise.delay(500).then(() => {
            if (sortField.value !== "" && (sortOrder === 'asc' || sortOrder === 'desc')) {
                return axios.get('api/restaurants&' + sortField.value + "&" + sortOrder);
            } else {
                return axios.get('api/restaurants');
            }
        }).then((resp) => {
            if (!resp.data.success) {
                throw resp.data.msg;
            }
            const restaurants = resp.data.msg;
            setRestaurants(restaurants);
            setLoading(false);
        }).catch((err) => {
            console.log(err);
            setLoading(false);
        });
    }, [navigate, sortField, sortOrder]);

    return (
        <Fragment>
            {loading ? (
                <LoadingComponent />
            ) :
                ((!restaurants || Object.keys(restaurants).length === 0) ? (
                    <Fragment>
                        <TextContent textAlign={"center"}>
                            <Heading size={2} pt={5} spaced>Zvolte restauraci</Heading>
                        </TextContent>
                        <Container>
                            <Columns centered vCentered>
                                <TextContent textAlign={"center"}>
                                    <p>Momentálně není žádná restaurace aktivní</p>
                                </TextContent>
                            </Columns>
                        </Container>
                    </Fragment>
                ) : (
                    <Fragment>
                        <TextContent textAlign={"center"}>
                            <Heading size={2} pt={5} spaced>Zvolte restauraci</Heading>
                            <Columns centered vCentered>
                                {sortableFields.length === 0 ? ""
                                    :
                                    <Fragment>
                                        <label htmlFor={"sortFieldSelect"} className="is-size-4">Seřadit podle:&nbsp;</label>
                                        <Select id="sortFieldSelect" value={sortField.value} onChange={handleSelectChange} size={"medium"}>
                                            <SelectItems />
                                        </Select>
                                        <Button onClick={handleSortOrderClick} size={"large"} color={"white"}><FontAwesomeIcon icon={sortOrder === 'asc' ? faArrowDownAZ : faArrowUpAZ} /></Button>
                                    </Fragment>
                                }
                            </Columns>
                        </TextContent>
                        <Container>
                            <Columns centered vCentered>
                                {Object.keys(restaurants).map((index) => (<RestaurantCard key={index} restaurant={restaurants[index]} />))}
                            </Columns>
                        </Container>
                    </Fragment>)
                )}
        </Fragment>
    );
}