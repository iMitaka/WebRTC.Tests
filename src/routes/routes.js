import React from 'react';
import { Route, Switch } from 'react-router-dom'
import TestRpc from '../components/test-rpc'
import TestRpc2 from '../components/test-connection'

const Routes = () => (
    <Switch>
        <Route exact path='/' component={TestRpc2} />
    </Switch>
)

export default Routes