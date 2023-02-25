import React, { Fragment, useEffect, useState } from "react";
import { Button, Container, Content as TextContent, Heading, Columns, Form } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { API_URL, createAxios, addSlashAfterUrl, PATHS } from "../../utils";
import LoadingComponent from "../../components/LoadingComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpAZ, faArrowDownAZ } from '@fortawesome/free-solid-svg-icons';
import RestaurantCard from "../../components/restaurants/RestaurantCard";
import { Promise } from "bluebird";
import SearchBar from "../../components/restaurants/SearchBar";

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
        const axios = createAxios(addSlashAfterUrl(API_URL));
        let delayTime = searchQuery ? 0 : 500;
        const fetchData = async () => {
            try {
                let apiUrl = `api/${PATHS.API.RESTAURANT}s`;

                if (searchQuery) {
                    apiUrl += '/search?text=' + searchQuery;
                    if (sortField.value !== "" && (sortOrder === 'asc' || sortOrder === 'desc')) {
                        apiUrl += '&field=' + sortField.value + '&orderBy=' + sortOrder;
                    }
                } else if (sortField.value !== "" && (sortOrder === 'asc' || sortOrder === 'desc')) {
                    apiUrl += '?field=' + sortField.value + '&orderBy=' + sortOrder;
                }

                const { data: { success, msg } } = await axios.get(apiUrl);
                if (success) {
                    setRestaurants(msg);
                    setSearchMsg('');
                } else {
                    setRestaurants({});
                    setSearchMsg("Žádný výsledek nenašlo!");
                }
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        }
        Promise.delay(delayTime).then(fetchData);
    }, [navigate, sortField, sortOrder, searchQuery]);

    return (
        <Fragment>
            <TextContent textAlign={"center"}>
                <Heading size={2} pt={5} spaced>Zvolte restauraci</Heading>
                <Container>
                    <Columns centered vCentered>
                        {sortableFields.length === 0 ? ""
                            :
                            <Fragment>
                                <label htmlFor={"sortFieldSelect"} className="is-size-4">Seřadit podle:&nbsp;</label>
                                <Select id="sortFieldSelect" value={sortField.value} onChange={handleSelectChange} size={"medium"}>
                                    <SelectItems />
                                </Select>
                                <Button onClick={handleSortOrderClick} size={"large"} color={"white"}><FontAwesomeIcon icon={sortOrder === 'asc' ? faArrowDownAZ : faArrowUpAZ} /></Button>
                                <SearchBar handleSearch={handleSearch} width={"300px"} />
                            </Fragment>
                        }
                    </Columns>
                </Container>
            </TextContent>
            {loading ? (
                <LoadingComponent />
            ) :
                (
                    (!restaurants || Object.keys(restaurants).length === 0) ? (
                        <Container>
                            <Columns centered vCentered>
                                <TextContent textAlign={"center"}>
                                    <p>{searchMsg !== '' ? searchMsg : "Momentálně není žádná restaurace aktivní :("}</p>
                                </TextContent>
                            </Columns>
                        </Container>
                    ) : (
                        <Container>
                            <Columns centered vCentered>
                                {Object.keys(restaurants).map((index) => (<RestaurantCard key={index} restaurant={restaurants[index]} />))}
                            </Columns>
                        </Container>
                    )
                )
            }
        </Fragment>
    );
}