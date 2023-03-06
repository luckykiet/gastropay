import React, { Fragment, useState } from "react"
import { Tabs } from "react-bulma-components"
import { Outlet, Link, useLocation } from "react-router-dom"
import { PATHS } from '../../utils';
const { Tab } = Tabs;
export default function ProfilePage() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    return (
        <Fragment>
            <Tabs size={"large"} align="center">
                <Tab active={activeTab === 0} renderAs={Link} to={PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE} onClick={() => handleTabClick(0)}>Profile</Tab>
                <Tab active={location.pathname === PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE + '/' + PATHS.ROUTERS.COMGATE} renderAs={Link} to={PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE + '/' + PATHS.ROUTERS.COMGATE} onClick={() => handleTabClick(1)}>Comgate</Tab>
            </Tabs>
            <Outlet />
        </Fragment>
    )
}