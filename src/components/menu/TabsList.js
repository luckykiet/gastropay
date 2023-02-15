import React, { useState, Fragment } from 'react';
import { Columns, Tabs } from 'react-bulma-components';
import ProductList from './ProductList';

const { Tab } = Tabs;
export default function TabsList({ listOfTabs, content }) {
  const [activeTab, setActiveTab] = useState(listOfTabs.length > 0 ? listOfTabs[0].ean : 0);
  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <Fragment>
      <Tabs align={'center'} size={'large'}>
        {listOfTabs.map((tab) => (
          <Tab key={tab.ean} active={activeTab === tab.ean} onClick={() => handleTabClick(tab.ean)}>
            {tab.name}
          </Tab>
        ))}
      </Tabs>
      <Columns centered vCentered>
        {listOfTabs.map((tab) => (
          activeTab === tab.ean && <ProductList key={tab.ean} groupId={tab.ean} content={content} />
        ))}
      </Columns>
    </Fragment>
  );
}