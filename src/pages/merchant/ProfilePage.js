import React, { Fragment } from "react"
import { Tabs } from "react-bulma-components"
import { Outlet, Link, useLocation } from "react-router-dom"
import { PATHS } from '../../utils';
const { Tab } = Tabs;
export default function ProfilePage() {
    const location = useLocation();

    return (
        <Fragment>
            <Tabs size={"large"} align="center">
                <Tab active={location.pathname === PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE} renderAs={Link} to={PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE}>Profile</Tab>
                <Tab active={location.pathname === PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE + '/' + PATHS.ROUTERS.COMGATE} renderAs={Link} to={PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE + '/' + PATHS.ROUTERS.COMGATE}>Comgate</Tab>
            </Tabs>
            <Outlet />
        </Fragment>
    )
}