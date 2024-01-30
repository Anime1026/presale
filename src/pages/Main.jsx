import React, { useState, useEffect } from "react";
import { useWallet } from "use-wallet2";
import { useBlockchainContext } from "../context";
import Dropdown from "../component/Dropdown";
import { Toast } from "../utils/message";
import ScrollAnimation from 'react-animate-on-scroll'
import logo from "../assets/images/logo.png";
import addresses from "../contract/resource/addresses.json";
import '../assets/css/animate.min.css'
import {presale} from '../constant/index'

export default function Main() {
    const wallet = useWallet();
    const [state, { BuyToken, ClaimToken }] = useBlockchainContext();
    const [flag, setFlag] = useState(1);
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [percent, setPercent] = useState(0);
    const [restTime, setRestTime] = useState(null);

    useEffect(() => {
        if (state.term || state.cTime === 0)
            setRestTime({
                day: 0,
                hour: 0,
                min: 0,
                sec: 0,
            });
        else {
            setRestTime({
                day: Math.floor(state.cTime / (24 * 3600)),
                hour: Math.floor(
                    (state.cTime -
                        Math.floor(state.cTime / (24 * 3600)) * 3600 * 24) /
                        3600
                ),
                min: Math.floor(
                    (state.cTime - Math.floor(state.cTime / 3600) * 3600) / 60
                ),
                sec: Math.floor(
                    state.cTime -
                        (Math.floor(state.cTime / 3600) * 3600 +
                            Math.floor(
                                Math.floor(
                                    (state.cTime -
                                        Math.floor(state.cTime / 3600) * 3600) /
                                        60
                                ) * 60
                            ))
                ),
            });
        }
    }, [state.cTime]);

    useEffect(() => {
        if (amount > 0) {
            Number(flag) == 1
                ? setTokenAmount((amount * state.ETHPrice) / state.price)
                : setTokenAmount(amount / state.price);
        } else {
            setTokenAmount(0);
        }
    }, [flag, amount]);

    useEffect(() => {
        if (state.totalSold !== null) {
            setPercent(50)
            // setPercent(
            //     Number((state.totalSold / state.totalAmount) * 100).toFixed(2)
            // );
        } else {
            setPercent(0);
        }
    }, [state.totalSold]);

    const handleConnect = () => {
        wallet.connect();
    };

    const handleBuy = () => {
        if (amount.toString().trim() === "" || amount <= 0) {
            Toast("Please input amount", "warning");
            return;
        }
        if (Number(wallet.chainId) !== state.supportChainId) {
            Toast("Please select Ethereum Mainnet", "warning");
            return;
        }
        setLoading(true);
        BuyToken({
            flag: flag,
            amount: amount,
        })
            .then((res) => {
                if (res) {
                    Toast("Successfully Buy", "success");
                } else {
                    Toast("Buy Failed", "error");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err.message);
                setLoading(false);
                Toast("Buy Failed", "error");
            });
    };

    const handleClaim = () => {
        try {
            setLoading(true);
            ClaimToken()
                .then(() => {
                    Toast("Successfully Claimed", "success");
                })
                .catch((err) => {
                    console.log(err.message);
                    setLoading(false);
                });
        } catch (err) {
            console.log(err.message);
            setLoading(false);
        }
    };

    const addToken = async () => {
        if (wallet.status !== "connected") {
            Toast("Please connect wallet", "warning");
            return;
        }

        let tokenAddress = addresses.WD;
        let tokenSymbol = "WD";
        let tokenDecimals = 18;
        let tokenImage = "https://nevervmore.netlify.app/favicon.ico";

        try {
            // wasAdded is a boolean. Like any RPC method, an error may be thrown.
            await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20", // Initially only supports ERC20, but eventually more!
                    options: {
                        address: tokenAddress, // The address that the token is at.
                        symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                        decimals: tokenDecimals, // The number of decimals in the token
                        image: tokenImage, // A string url of the token logo
                    },
                },
            });
        } catch (error) {
            console.log(error.message);
            Toast("Failed token add", "error");
        }
    };

    return (
        <div className="dashboard">
            <div className="spacer-half"></div>

            {/* Begin Header */}
            <div className="container" >
                <a href="#">
                    <div className="header" >
                        <img src={logo} alt="" style={{width: '70px', height: '70px'}}/>
                        <h2 className="logo-title" style={{margin: 0}}>Nevermore</h2>
                    </div>
                </a>
            </div>
            {/* End Header */}

            <div className="spacer-half"></div>

            {/* Begin Mainboard */}
            <section className="mainboard">
                <div className="container">
                        <div className="flex center middle text-center">
                            <h3 style={{marginTop: '100px'}}>Nevermore Academy Private-Sale</h3>
                        </div>
                    {/* Begin Presale Card */}
                    <div className="row">
                        <div className="col-lg-8 col-md-6 col-sm-12">
                                <div className="card">
                                    <div className="presale__panel">
                                        <div className="presale__content">
                                            <div className="row">
                                                <div className="col-lg-6 col-sm-12">
                                                        <div className="flex">
                                                            <div className="status success">KYC</div>
                                                            <div className="status upcoming">AUDITED</div>
                                                        </div>
                                                </div>
                                                <div className="col-lg-6 col-sm-12" >
                                                    <div className="flex" style={{justifyContent:'flex-end'}}>
                                                        <button onClick={addToken} className="metamask-button">
                                                            Add to Metamask
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="spacer-10"></div>
                                            <div className="slider">    
                                                <ScrollAnimation animateIn="fadeIn" animateOut="fadeOut">
                                                    <h3 style={{fontFamily: 'visual', fontSize:'38px'}}>Buy your $WD Tokens</h3>
                                                </ScrollAnimation>
                                                <div className="presale__control">
                                                    <label style={{fontSize: '24px'}}>Select: </label>
                                                    <Dropdown
                                                        selectedKey="ETH" 
                                                        onChange={(key) => {setFlag({key});}}	
                                                        values = {
                                                            [
                                                                {
                                                                    name: 'ETH', key: 1, img:'eth.png'
                                                                },
                                                                {
                                                                    name: 'USDC', key: 2, img:'usdc.png'
                                                                }
                                                            ]
                                                        }
                                                    />
                                                </div>
                                                <br />
                                                <div className="presale__control">
                                                    <label style={{fontSize: '24px'}}>Amount: </label>
                                                    <input
                                                        type="number"
                                                        onChange={(e) =>
                                                            setAmount(e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <br />
                                                {wallet.status === "connected" ? (
                                                    <div className="presale__control">
                                                        <label style={{fontSize: '24px'}}>Token: </label>
                                                        <p className="flex" style={{alignItems:'center', fontSize:'22px', padding: 0, margin:0}}>
                                                            {state.price === null ||
                                                            state.ETHPrice === null
                                                                ? "updating..."
                                                                : Number(
                                                                    tokenAmount.toFixed(2)
                                                                ).toLocaleString() + "  "}
                                                                <span className="color" style={{marginLeft:'8px'}}> WD</span>
                                                        </p>
                                                    </div>
                                                ) : null}
                                                <div className="spacer-single"></div>

                                                <div className="flex middle center">
                                                    {wallet.status === "connecting" ? (
                                                        <button className="button-white">
                                                            Connecting...
                                                        </button>
                                                    ) : wallet.status === "connected" ? (
                                                        loading ? (
                                                            <button className="button-white">
                                                                loading...
                                                            </button>
                                                        ) : state.term ? (
                                                            <button
                                                                className="button-white"
                                                                onClick={handleClaim}
                                                            >
                                                                Claim WD
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="button-white"
                                                                onClick={handleBuy}
                                                            >
                                                                Buy WD Now
                                                            </button>
                                                        )
                                                    ) : (
                                                        <button
                                                            className="button-white"
                                                            onClick={handleConnect}
                                                        >
                                                            Wallet Connect
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="spacer-half"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="info-panel" style={{marginTop: '3rem'}}>
                                    <div className="infos">
                                        <p>Presale address</p>
                                        <a style={{color: '#ff535b'}} href= {"https://etherscan.io/address/" + presale?.presaleContract || ""}  target={"_blank"}>{presale?.presaleContract || ""}</a>
                                    </div>
                                    <div className="infos">
                                        <p>Token address</p>
                                        <a style={{color: '#ff535b'}} href={"https://etherscan.io/address/" + presale?.tokenContract} target={"_blank"}>{presale?.tokenContract || ""}</a>
                                    </div>
                                    <div className="infos">
                                        <p>Category</p>
                                        <div className="status upcoming">{presale?.category || ""}</div>
                                    </div>
                                    <div className="infos">
                                        <p>Token name</p>
                                        <p>{presale?.tokenName || ""}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Token symbol</p>
                                        <p>{presale?.tokenSymbol || ""}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Token decimals</p>
                                        <p>{presale?.tokenDecimals || ""}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Total supply</p>
                                        <p>{presale?.totalSupply || ""}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Tokens for Presale</p>
                                        <p>{presale?.tokensForPresale + " " + presale?.tokenSymbol}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Tokens for Liquidity</p>
                                        <p>{presale?.tokensForLiquidity + " " + presale?.tokenSymbol}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Initial Market Cap</p>
                                        <p>${presale?.initialMarketCapUSD + " "}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Presale rate</p>
                                        <p>1 ETH = {presale?.presaleRate + " " + presale?.tokenSymbol}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Listing rate</p>
                                        <p>1 ETH = {presale?.listingRate + " " + presale?.tokenSymbol}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Soft Cap</p>
                                        <p>{presale?.softCapETH} ETH</p>
                                    </div>
                                    <div className="infos">
                                        <p>Hard Cap</p>
                                        <p>{presale?.hardCapETH} ETH</p>
                                    </div>
                                    <div className="infos">
                                        <p>Presale start time</p>
                                        <p>{presale?.presaleStartTime || ""}</p>
                                    </div>
                                    <div className="infos">
                                        <p>Presale end time</p>
                                        <p>{presale?.presaleEndTime || ""}</p>
                                    </div>
                                </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12">
                                    <div className="info-panel">
                                        <p>
                                            {state.term
                                                ? "Presale Ended"
                                                : state.cTime === 0
                                                ? "Public Sale"
                                                : "Private Sale"}
                                        </p>
                                        <div className="row time">
                                            <div className="col-3">
                                                <div>
                                                    {restTime === null
                                                        ? null
                                                        : restTime.day > 9
                                                        ? restTime.day
                                                        : "0" + restTime.day}
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div>
                                                    {restTime === null
                                                        ? null
                                                        : restTime.hour > 9
                                                        ? restTime.hour
                                                        : "0" + restTime.hour}
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div>
                                                    {restTime === null
                                                        ? null
                                                        : restTime.min > 9
                                                        ? restTime.min
                                                        : "0" + restTime.min}
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div>
                                                    {restTime === null
                                                        ? null
                                                        : restTime.sec > 9
                                                        ? restTime.sec
                                                        : "0" + restTime.sec}
                                                </div>
                                            </div>
                                        </div>   
                                        <div className="row time">
                                            <div className="col-3">
                                            <p style={{margin:0, color: 'grey', fontSize: '0.8rem'}}>Days</p>
                                            </div>
                                            <div className="col-3">
                                                <p style={{margin:0, color: 'grey', fontSize: '0.8rem'}}>Hours</p>
                                            </div>
                                            <div className="col-3">   
                                                <p style={{margin:0, color: 'grey', fontSize: '0.8rem'}}>Minutes</p>
                                            </div>
                                            <div className="col-3">
                                                <p style={{margin:0, color: 'grey', fontSize: '0.8rem'}}>Seconds</p>
                                            </div>
                                        </div>
                                        <div className="bar" style={{marginTop: '2rem'}}>
                                            <div
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                        <p>
                                            Sold Amount (
                                            {Number(state.totalSold).toFixed(2)} $)
                                        </p>
                                        <div className="spacer-10"></div>
                                        <div className="status_bar">
                                            <div></div>
                                            <div></div>
                                        </div>
                                        <div style={{display: 'flex', justifyContent:'space-between', marginTop: '1rem'}}>
                                            <span style={{color: 'rgb(150, 150, 150)'}}>softcap ({presale?.softCapETH || "0"} ETH)</span>
                                            <span style={{color: 'rgb(150, 150, 150)'}}>hardcap ({presale?.hardCapETH || "0"} ETH)</span>
                                        </div>
                                    </div>
                                    <div className="info-panel" style={{marginTop:'2rem'}}>
                                        <div className="infos">
                                            <p>Status</p>
                                            <div className = {`status ${presale?.status}`}>{presale?.status || "Upcoming"}</div>
                                        </div>
                                        <div className="infos">
                                            <p>Sale type</p>
                                            <p>{presale?.saleType || ""}</p>
                                        </div>
                                        <div className="infos">
                                            <p>Minimum Buy</p>
                                            <p>{presale?.minimumBuyETH || "0.0"} ETH</p>
                                        </div>
                                        <div className="infos">
                                            <p>Maximum Buy</p>
                                            <p>{presale?.maximumBuyETH || "0.0"} ETH</p>
                                        </div>
                                        <div className="infos">
                                            <p>My Contribution</p>
                                            <p>{presale?.myContribution || "0.0"} ETH</p>
                                        </div>
                                        <div className="infos">
                                            <p>Total Contributors</p>
                                            <p>{presale?.totalContribution || "0.0"} ETH</p>
                                        </div>
                                    </div>
                                    <div className="info-panel" style={{marginTop:'2rem'}}>
                                        <div className="infos">
                                            <p>Audit</p>
                                            <div className={`status ${presale?.audit ? 'success' : 'failed'}`}>{presale?.audit ? 'Yes': 'No'}</div>
                                        </div>
                                        <div className="infos">
                                            <p>KYC</p>
                                            <div className={`status ${presale?.kyc ? 'success' : 'failed'}`}>{presale?.kyc ? 'Yes': 'No'}</div>
                                        </div>
                                        <div className="infos">
                                            <p>Tokens supply owned by team</p>
                                            <div className="status failed">{presale?.tokensOwnedByTeamPercent || "0"} %</div>
                                        </div>
                                        <div className="infos">
                                            <p>Lock duration</p>
                                            <div className="status failed">{presale?.lockDurationDays || "0"} Days</div>
                                        </div>
                                        <div className="infos">
                                            <p>Lock percentage</p>
                                            <div className="status failed">{presale?.lockPercentage || "0"} %</div>
                                        </div>
                                    </div>
                        </div>
                    </div>
                    {/* End Presale Card */}
                </div>

            </section>
            {/* End Mainboard */}

            <div className="spacer-double"></div>

            {/* Begin Footer */}
            <section className="footer container">
                <a href="#">
                    <div>
                        <img src={logo} alt="" style={{width: '70px', height: '70px'}}/>
                        <h3 className="logo-title">Nevermore</h3>
                    </div>
                </a>
                <p>Copyright &copy; {new Date().getFullYear()}</p>
            </section>
            {/* End Footer */}
        </div>
    );
}
