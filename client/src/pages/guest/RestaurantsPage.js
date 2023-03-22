import React, { Fragment, useEffect, useState } from "react";
import { Container, Content as TextContent, Heading, Columns } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { createAxios, addSlashAfterUrl } from "../../utils";
import LoadingComponent from "../../components/LoadingComponent";
import RestaurantCard from "../../components/restaurants/RestaurantCard";
import { Promise } from "bluebird";
import SearchBar from "../../components/restaurants/SearchBar";
import { API } from '../../config/api';
import { CONFIG } from '../../config/config';

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

export default function RestaurantsPage() {
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [sortField, setSortField] = useState({ value: sortableFields[0]?.value ? sortableFields[0].value : "" });
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMsg, setSearchMsg] = useState('');
    const navigate = useNavigate();

    const handleSelectChange = (event) => {
        setSortField({ value: event.target.value });
        setLoading(true);
    }

    const handleSortOrderClick = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        setLoading(true);
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        document.title = `Restaurace | ${CONFIG.APP_NAME}`;
    }, [])

    useEffect(() => {
        const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
        let delayTime = searchQuery ? 0 : 500;
        const fetchData = async () => {
            try {
                let apiUrl = `${API.RESTAURANT}s`;

                if (searchQuery) {
                    apiUrl += '/search?text=' + searchQuery;
                    if (sortField.value !== "" && (sortOrder === 'asc' || sortOrder === 'desc')) {
                        apiUrl += '&field=' + sortField.value + '&orderBy=' + sortOrder;
                    }
                } else if (sortField.value !== "" && (sortOrder === 'asc' || sortOrder === 'desc')) {
                    apiUrl += '?field=' + sortField.value + '&orderBy=' + sortOrder;
                }

                const { data: { success, msg } } = await axios.get(apiUrl);

                if (!success) {
                    throw new Error(msg);
                }
                setRestaurants(msg);
                setSearchMsg('');
            } catch (err) {
                setRestaurants({});
                setSearchMsg("Žádný výsledek nenašlo!");
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(delayTime).then(fetchData);
    }, [navigate, sortField, sortOrder, searchQuery]);

    return (
        <Fragment>
            <TextContent textAlign={"center"}>
                <Heading size={2} pt={5} spaced>Zvolte restauraci</Heading>
                <SearchBar
                    sortableFields={sortableFields}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    handleSelectChange={handleSelectChange}
                    handleSortOrderClick={handleSortOrderClick}
                    handleSearch={handleSearch}
                    width={"300px"} />
            </TextContent>
            {loading ? (
                <LoadingComponent />
            ) :
                (
                    (!restaurants || restaurants.length === 0) ? (
                        <Container className="has-text-centered">
                            <p className="is-size-4 has-text-weight-bold">{searchMsg !== '' ? searchMsg : "Momentálně není žádná restaurace aktivní :("}</p>
                        </Container>
                    ) : (
                        <Container>
                            <Columns centered>
                                {Object.keys(restaurants).map((index) => (<RestaurantCard key={index} restaurant={restaurants[index]} />))}
                            </Columns>
                        </Container>
                    )
                )
            }
        </Fragment>
    );
}