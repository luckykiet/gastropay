import React, { Fragment } from 'react';
import { Form, Container, Button } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpAZ, faArrowDownAZ } from '@fortawesome/free-solid-svg-icons';

export default function SearchBar({ sortableFields, sortField, sortOrder, handleSelectChange, handleSortOrderClick, handleSearch, width }) {
    const { Input, Select } = Form;
    return (
        <Container className="has-text-centered">
            {sortableFields.length === 0 ? ""
                :
                <Fragment>
                    <label htmlFor={"sortFieldSelect"} className="is-size-4">Seřadit podle:&nbsp;</label>
                    <Select id="sortFieldSelect" value={sortField.value} onChange={handleSelectChange} size={"medium"}>
                        {sortableFields.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.name}
                            </option>
                        ))}
                    </Select>
                    <Button onClick={handleSortOrderClick} size={"large"} color={"white"}><FontAwesomeIcon icon={sortOrder === 'asc' ? faArrowDownAZ : faArrowUpAZ} /></Button>
                    <Input style={{ width: width }} type={"search"} onChange={handleSearch} size={"medium"} rounded placeholder="Hledejte restauraci..."></Input>
                </Fragment>
            }
        </Container>
    );
}

