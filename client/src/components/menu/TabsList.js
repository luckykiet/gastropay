import React, { useState, Fragment } from 'react';
import { Columns, Tabs } from 'react-bulma-components';
import ProductList from './ProductList';

const { Tab } = Tabs;
export default function TabsList({ listOfTabs, content }) {
  const [activeTab, setActiveTab] = useState(listOfTabs.length > 0 ? listOfTabs[0].id : 0);

  return (
    <Fragment>
      <Tabs align={'center'} size={'large'}>
        {listOfTabs.map((tab) => (
          <Tab className='has-text-weight-semibold is-size-4' key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.name}
          </Tab>
        ))}
      </Tabs>
      <Columns centered>
        {listOfTabs.map((tab) => (
          activeTab === tab.id && <ProductList key={tab.id} group={tab.id} content={content} />
        ))}
      </Columns>
    </Fragment>
  );
}