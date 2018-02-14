import React from 'react';
import { Route, Switch } from 'react-router-dom'
import TestRpc from '../components/test-rpc'

const Routes = () => (
    <Switch>
        <Route exact path='/' component={TestRpc} />
    </Switch>
)

export default Routes