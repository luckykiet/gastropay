import React from 'react';
import { daysOfWeeksCzech, isOpening } from '../../utils';
import moment from 'moment';

export default function OpeningTimeStatus({ todayOpeningTime, nextOpenTime }) {
    const { isOpen, from, to } = todayOpeningTime.today;
    const todayMoment = moment();
    const nextDay = Object.keys(nextOpenTime)[0];
    if (!isOpen && !nextOpenTime[nextDay]?.isOpen) {
        return (
            <p>
                <strong className="has-text-danger">Dočasně uzavřeno</strong>
            </p>
        );
    } else if (!isOpen && nextOpenTime[nextDay]?.isOpen) {
        const beginTime = nextOpenTime[nextDay].from;
        return (
            <p>
                <strong className="has-text-danger">Zavřeno</strong> &#x2022; Otevírá v{" "}
                {daysOfWeeksCzech[nextDay]?.shortcut} {beginTime}
            </p>
        );
    } else {
        const isOpeningNow = isOpening(from, to);
        if (isOpeningNow) {
            return (
                <p>
                    <strong className="has-text-success">Otevřeno</strong> &#x2022; Zavírá v{" "}
                    {to}
                </p>
            );
        } else {
            if (todayMoment.isBefore(moment(from, "HH:mm"))) {
                const beginTime = from;
                return (
                    <p>
                        <strong className="has-text-danger">Zavřeno</strong> &#x2022; Otevírá v{" "}
                        {beginTime}
                    </p>
                );
            } else {
                const beginTime = nextOpenTime[nextDay].from;
                return (
                    <p>
                        <strong className="has-text-danger">Zavřeno</strong> &#x2022; Otevírá v{" "}
                        {daysOfWeeksCzech[nextDay].shortcut} {beginTime}
                    </p>
                );
            }
        }
    }
}