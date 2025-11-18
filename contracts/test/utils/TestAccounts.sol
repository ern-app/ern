// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import {Accounts} from "./Accounts.sol";

import {Test} from "forge-std/Test.sol";

contract TestAccounts is Test {
    Accounts accounts;

    address[] accountsList;
    address public A;
    address public B;
    address public C;
    address public D;
    address public E;
    address public F;
    address public G;

    function setupAccounts() public {
        accounts = new Accounts();

        address[10] memory tempAccounts;
        for (uint256 i = 0; i < accounts.getAccountsCount(); i++) {
            tempAccounts[i] = vm.addr(uint256(accounts.accountsPks(i)));
        }

        accountsList = tempAccounts;

        A = accountsList[0];
        B = accountsList[1];
        C = accountsList[2];
        D = accountsList[3];
        E = accountsList[4];
        F = accountsList[5];
        G = accountsList[6];

        vm.label(tempAccounts[0], "User A");
        vm.label(tempAccounts[1], "User B");
        vm.label(tempAccounts[2], "User C");
        vm.label(tempAccounts[3], "User D");
        vm.label(tempAccounts[4], "User E");
        vm.label(tempAccounts[5], "User F");
        vm.label(tempAccounts[6], "User G");
    }
}
