import React, { useState, Fragment } from 'react';
import { Columns, Tabs } from 'react-bulma-components';
import ProductList from './ProductList';

const { Tab } = Tabs;
export default function TabsList({ listOfTabs, content }) {
  const [activeTab, setActiveTab] = useState(listOfTabs.length > 0 ? listOfTabs[0].id : 0);
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <Fragment>
      <Tabs align={'center'} size={'large'}>
        {listOfTabs.map((tab) => (
          <Tab key={tab.id} active={activeTab === tab.id} onClick={() => handleTabClick(tab.id)}>
            {tab.name}
          </Tab>
        ))}
      </Tabs>
      <Columns centered vCentered>
        {listOfTabs.map((tab) => (
          activeTab === tab.id && <ProductList key={tab.id} group={tab.id} content={content} />
        ))}
      </Columns>
    </Fragment>
  );
}