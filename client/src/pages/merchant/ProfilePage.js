import React, { Fragment, useEffect } from "react"
import { Tabs } from "react-bulma-components"
import { Outlet, Link, useLocation } from "react-router-dom"
import { PATHS } from '../../config/paths';
import { CONFIG } from "../../config/config";
const { Tab } = Tabs;
export default function ProfilePage() {
    const location = useLocation();
    useEffect(() => {
        document.title = `Profile | ${CONFIG.APP_NAME}`;
    }, [])
    return (
        <Fragment>
            <Tabs size={"large"} align="center">
                <Tab active={location.pathname === PATHS.MERCHANT + '/' + PATHS.PROFILE} renderAs={Link} to={PATHS.MERCHANT + '/' + PATHS.PROFILE}>Profile</Tab>
                <Tab active={location.pathname === PATHS.MERCHANT + '/' + PATHS.PROFILE + '/' + PATHS.COMGATE} renderAs={Link} to={PATHS.MERCHANT + '/' + PATHS.PROFILE + '/' + PATHS.COMGATE}>Comgate</Tab>
                <Tab active={location.pathname === PATHS.MERCHANT + '/' + PATHS.PROFILE + '/' + PATHS.CSOB} renderAs={Link} to={PATHS.MERCHANT + '/' + PATHS.PROFILE + '/' + PATHS.CSOB}>ČSOB</Tab>
            </Tabs>
            <Outlet />
        </Fragment>
    )
}