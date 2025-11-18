// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console2 as console} from "forge-std/console2.sol";

contract Logging {
    function _log() internal pure {
        console.log();
    }

    function _log(string memory a) internal pure {
        console.log(a);
    }

    function _log(string memory a, string memory b) internal pure {
        console.log(string.concat(a, b));
    }

    function _log(string memory a, string memory b, string memory c) internal pure {
        console.log(string.concat(a, b, c));
    }

    function _log(string memory a, string memory b, string memory c, string memory d) internal pure {
        console.log(string.concat(a, b, c, d));
    }

    function _log(string memory a, string memory b, string memory c, string memory d, string memory e) internal pure {
        console.log(string.concat(a, b, c, d, e));
    }

    function _log(string memory a, string memory b, string memory c, string memory d, string memory e, string memory f)
        internal
        pure
    {
        console.log(string.concat(a, b, c, d, e, f));
    }

    function _log(
        string memory a,
        string memory b,
        string memory c,
        string memory d,
        string memory e,
        string memory f,
        string memory g
    ) internal pure {
        console.log(string.concat(a, b, c, d, e, f, g));
    }

    function _log(
        string memory a,
        string memory b,
        string memory c,
        string memory d,
        string memory e,
        string memory f,
        string memory g,
        string memory h
    ) internal pure {
        console.log(string.concat(a, b, c, d, e, f, g, h));
    }

    function _log(
        string memory a,
        string memory b,
        string memory c,
        string memory d,
        string memory e,
        string memory f,
        string memory g,
        string memory h,
        string memory i
    ) internal pure {
        console.log(string.concat(a, b, c, d, e, f, g, h, i));
    }

    function _log(
        string memory a,
        string memory b,
        string memory c,
        string memory d,
        string memory e,
        string memory f,
        string memory g,
        string memory h,
        string memory i,
        string memory j
    ) internal pure {
        console.log(string.concat(a, b, c, d, e, f, g, h, i, j));
    }

    function _log(
        string memory a,
        string memory b,
        string memory c,
        string memory d,
        string memory e,
        string memory f,
        string memory g,
        string memory h,
        string memory i,
        string memory j,
        string memory k
    ) internal pure {
        console.log(string.concat(a, b, c, d, e, f, g, h, i, j, k));
    }

    function slog(string memory a) internal pure {
        _log(a);
    }

    function slog(string memory a, string memory b) internal pure {
        _log(a, b);
    }

    function slog(string memory a, string memory b, string memory c) internal pure {
        _log(a, b, c);
    }

    function slog(string memory a, string memory b, string memory c, string memory d) internal pure {
        _log(a, b, c, d);
    }

    function slog(string memory a, string memory b, string memory c, string memory d, string memory e) internal pure {
        _log(a, b, c, d, e);
    }

    function slog(string memory a, string memory b, string memory c, string memory d, string memory e, string memory f)
        internal
        pure
    {
        _log(a, b, c, d, e, f);
    }
}
