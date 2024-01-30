import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useEffect,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "use-wallet2";

import {
    PresaleContract,
    USDCContract,
    provider,
    supportChainId,
} from "../contract";
import { toBigNum, fromBigNum } from "../utils";

const BlockchainContext = createContext();

export function useBlockchainContext() {
    return useContext(BlockchainContext);
}

function reducer(state, { type, payload }) {
    return {
        ...state,
        [type]: payload,
    };
}

const INIT_STATE = {
    signer: null,
    price: 0,
    ETHPrice: 0,
    totalSold: 0,
    totalAmount: 1000000,
    cTime: 0,
    term: null,
    supportChainId: supportChainId,
    interval: null,
};

export default function Provider({ children }) {
    const wallet = useWallet();
    const [state, dispatch] = useReducer(reducer, INIT_STATE);

    /* ------------ Wallet Section ------------- */
    useEffect(() => {
        getPrice();
        getTotal();
        getTime();

        const autoAccess = setInterval(() => {
            getTotal();
        }, 5000);
        return () => clearInterval(autoAccess);
    }, []);

    useEffect(() => {
        const getSigner = async () => {
            if (wallet.status === "connected") {
                const provider = new ethers.providers.Web3Provider(
                    wallet.ethereum
                );
                const signer = provider.getSigner();
                dispatch({
                    type: "signer",
                    payload: signer,
                });
            }
        };

        getSigner();
        getPrice();
    }, [wallet.status]);

    const getPrice = async () => {
        try {
            let promiseArr = [];
            promiseArr.push(PresaleContract.getPrice());
            promiseArr.push(PresaleContract.ethPrice());

            let result = await Promise.all(promiseArr);

            dispatch({
                type: "price",
                payload: fromBigNum(result[0], 6),
            });
            dispatch({
                type: "ETHPrice",
                payload: fromBigNum(result[1], 6),
            });
        } catch (err) {
            console.log(err.message);
        }
    };

    const getTotal = async () => {
        try {
            let promiseArr = [];
            promiseArr.push(provider.getBalance(PresaleContract.address));
            promiseArr.push(USDCContract.balanceOf(PresaleContract.address));
            promiseArr.push(PresaleContract.isEnd());
            promiseArr.push(PresaleContract.ethPrice());

            let result = await Promise.all(promiseArr);

            let total =
                fromBigNum(result[0], 18) * fromBigNum(result[3], 6) +
                fromBigNum(result[1], 18);

            dispatch({
                type: "totalSold",
                payload: total,
            });
            dispatch({
                type: "term",
                payload: result[2],
            });
        } catch (err) {
            console.log(err.message);
        }
    };

    const getTime = async () => {
        let promiseArr = [];
        promiseArr.push(PresaleContract.startTime());
        promiseArr.push(PresaleContract.terms());
        let result = await Promise.all(promiseArr);
        let startTime = fromBigNum(result[0], 0);
        let duration = fromBigNum(result[1].presalePeriod, 0);

        const autoTime = setInterval(() => {
            updateTime({
                startTime,
                duration,
            });
        }, 1000);
        return () => clearInterval(autoTime);
    };

    const updateTime = async (props) => {
        const { startTime, duration } = props;
        let nowTime = new Date().valueOf() / 1000;
        let period;

        if (nowTime > startTime + duration) {
            period = 0;
        } else {
            period = startTime + duration - nowTime;
        }

        dispatch({
            type: "cTime",
            payload: period,
        });
    };

    /* ------------ Token Buy Section ------------- */
    const BuyToken = async (props) => {
        try {
            const { amount, flag } = props;
            const signedPresaleContract = PresaleContract.connect(state.signer);
            if (flag == 1) {
                let tx = await signedPresaleContract.buyETH({
                    value: toBigNum(amount),
                });
                await tx.wait();
            } else if (flag == 2) {
                let signedUSDCContract = USDCContract.connect(state.signer);
                let tx = await signedUSDCContract.approve(
                    PresaleContract.address,
                    toBigNum(amount)
                );
                await tx.wait();

                let tx1 = await signedPresaleContract.buyWithUsdc(
                    toBigNum(amount)
                );
                await tx1.wait();
            }
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const ClaimToken = async () => {
        const signedPresaleContract = PresaleContract.connect(state.signer);
        var tx = await signedPresaleContract.claim();
        await tx.wait();
    };

    return (
        <BlockchainContext.Provider
            value={useMemo(
                () => [state, { dispatch, BuyToken, ClaimToken }],
                [state, BuyToken]
            )}
        >
            {children}
        </BlockchainContext.Provider>
    );
}
