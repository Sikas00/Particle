﻿// ==UserScript==
// @version         1.4.2
// @name            YouTube +
// @namespace       https://github.com/ParticleCore
// @description     YouTube with more freedom
// @icon            https://raw.githubusercontent.com/ParticleCore/Particle/gh-pages/images/YT%2Bicon.png
// @match           *://www.youtube.com/*
// @exclude         *://www.youtube.com/tv*
// @exclude         *://www.youtube.com/embed/*
// @run-at          document-start
// @downloadURL     https://github.com/ParticleCore/Particle/raw/master/src/Userscript/YouTubePlus.user.js
// @homepageURL     https://github.com/ParticleCore/Particle
// @supportURL      https://github.com/ParticleCore/Particle/wiki
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UMVQJJFG4BFHW
// @grant           GM_getValue
// @grant           GM_setValue
// @noframes
// ==/UserScript==
(function () {
    "use strict";
    var particle = {
        inject: function(is_userscript) {
            function eventHandler(event) {
                var i, keys, type, target, listener, useCapture;
                type = event[1] || event.type;
                target = event[0] || event.target;
                listener = event[2];
                useCapture = !!event[3];
                if (Array.isArray(event)) {
                    if (event[4] && events[type] && events[type][listener.name]) {
                        delete events[type][listener.name];
                        if (Object.keys(events[type]).length === 0) {
                            target.removeEventListener(type, eventHandler, useCapture);
                            delete events[type];
                        }
                    } else if (!event[4]) {
                        target.addEventListener(type, eventHandler, useCapture);
                        events[type] = events[type] || {};
                        events[type][listener.name] = [listener, useCapture];
                    }
                } else if (events[type]) {
                    keys = Object.keys(events[type]);
                    i = keys.length;
                    while (i--) {
                        if ((!events[type][keys[i]][1] && event.eventPhase > 1) || (events[type][keys[i]][1] && event.eventPhase < 3)) {
                            events[type][keys[i]][0](event);
                        }
                    }
                }
            }
            function setLocale(content) {
                var i, j, list, temp, ytplabel;
                ytplabel = content.querySelectorAll("[data-p]");
                i = ytplabel.length;
                while (i--) {
                    list = ytplabel[i].dataset.p.split("&");
                    j = list.length;
                    while (j--) {
                        temp = list[j].split("|");
                        if (temp[0] === "tnd") {
                            ytplabel[i].appendChild(document.createTextNode(lang(temp[1])));
                        } else if (temp[0] === "ttl") {
                            ytplabel[i].setAttribute("title", lang(temp[1]));
                        } else {
                            ytplabel[i].dataset.tooltipText = lang(temp[1]);
                        }
                    }
                }
                return content;
            }
            function lang(label) {
                function getLocale(data) {
                    delete language.fetching;
                    data = document.documentElement.dataset.setlocale;
                    data = data && JSON.parse(data);
                    if (data) {
                        user_settings.extLang[lang.ytlang] = JSON.parse(document.documentElement.dataset.setlocale);
                        user_settings.extLang[lang.ytlang].lastMod = new Date().getTime();
                        user_settings.extLang.nextCheck = new Date().getTime() + 6048E5;
                        set("extLang", user_settings.extLang);
                    }
                    lang.observer.disconnect();
                }
                function getLanguage(data) {
                    delete language.fetching;
                    if (data.target.readyState === 4 && data.target.status === 200) {
                        user_settings.extLang[lang.ytlang] = JSON.parse(data.target.response);
                        user_settings.extLang[lang.ytlang].lastMod = new Date(data.target.getResponseHeader("Last-Modified")).getTime();
                    }
                    user_settings.extLang.nextCheck = new Date().getTime() + 6048E5;
                    set("extLang", user_settings.extLang);
                }
                function checkModified(data) {
                    delete language.fetching;
                    if (data.target.readyState === 4 && data.target.status === 200) {
                        language.fetching = true;
                        localXHR("GET", getLanguage, lang.urlBase + lang.ytlang + ".json", ["Accept", "application/vnd.github.raw"]);
                    }
                }
                lang.ytlang = window.yt && window.yt.config_ && window.yt.config_.GAPI_LOCALE;
                lang.urlBase = "https://api.github.com/repos/ParticleCore/Particle/contents/Locale/";
                if (!user_settings.extLang) {
                    set("extLang", {});
                }
                if (user_settings.GEN_LOCL_LANG && user_settings.localLang && user_settings.localLang[label]) {
                    if (JSON.stringify(user_settings.extLang) !== "{}") {
                        set("extLang", {});
                    }
                    return user_settings.localLang[label];
                }
                if (!user_settings.GEN_LOCL_LANG && lang.ytlang && lang.ytlang !== "en_US") {
                    if (user_settings.extLang[lang.ytlang] && user_settings.extLang[lang.ytlang][label]) {
                        if (!language.fetching && user_settings.extLang.nextCheck && user_settings.extLang.nextCheck <= new Date().getTime()) {
                            language.fetching = true;
                            if (!is_userscript) {
                                lang.observer = new MutationObserver(getLocale);
                                lang.observer.observe(document.documentElement, {
                                    attributes: true,
                                    attributeFilter: ["data-setlocale"]
                                });
                                document.documentElement.dataset.getlocale = lang.ytlang;
                            } else {
                                localXHR("HEAD", checkModified, lang.urlBase + lang.ytlang + ".json", ["If-Modified-Since", new Date(user_settings.extLang[lang.ytlang].lastMod).toUTCString()]);
                            }
                            user_settings.extLang.nextCheck = new Date().getTime() + 6048E5;
                            set("extLang", user_settings.extLang);
                        }
                        return user_settings.extLang[lang.ytlang][label];
                    }
                    if (!user_settings.extLang[lang.ytlang] && !language.fetching && (!user_settings.extLang.nextCheck || user_settings.extLang.nextCheck <= new Date().getTime())) {
                        language.fetching = true;
                        if (!is_userscript) {
                            lang.observer = new MutationObserver(getLocale);
                            lang.observer.observe(document.documentElement, {
                                attributes: true,
                                attributeFilter: ["data-setlocale"]
                            });
                            document.documentElement.dataset.getlocale = lang.ytlang;
                        } else {
                            localXHR("GET", getLanguage, lang.urlBase + lang.ytlang + ".json", ["Accept", "application/vnd.github.raw"]);
                        }
                    }
                }
                return language[label];
            }
            function settingsMenu() {
                function getBlacklist(blist) {
                    var list, sortAlpha;
                    list = user_settings.blacklist;
                    sortAlpha = [];
                    Object.keys(list).forEach(ytid => {
                        var obj = {};
                        obj[ytid] = list[ytid];
                        sortAlpha.push(obj);
                    });
                    sortAlpha.sort((previous, next) => previous[Object.keys(previous)[0]].localeCompare(next[Object.keys(next)[0]])).forEach(obj => {
                        var lnk, keys, temp;
                        keys = Object.keys(obj);
                        temp = document.createElement("template");
                        temp.innerHTML = "<div class='blacklist'><button class='close ytplus_sprite'></button><a target='_blank'></a></div>";
                        temp = temp.content.firstChild;
                        lnk = temp.querySelector("a");
                        lnk.href = "/channel/" + keys[0];
                        lnk.setAttribute("title", obj[keys[0]]);
                        lnk.textContent = obj[keys[0]];
                        blist.appendChild(temp);
                        blist.appendChild(document.createTextNode("\n"));
                    });
                }
                function getValues(menu) {
                    var i, ytp, list;
                    if (user_settings) {
                        list = menu.querySelector("#blacklist");
                        if (list) {
                            getBlacklist(list);
                        }
                        ytp = menu.querySelectorAll("input[id]");
                        i = ytp.length;
                        while (i--) {
                            if (ytp[i].type === "checkbox" && user_settings[ytp[i].id] === true) {
                                ytp[i].setAttribute("checked", "true");
                            }
                            if (ytp[i].type === "text" && typeof user_settings[ytp[i].id] === 'string') {
                                ytp[i].setAttribute("value", user_settings[ytp[i].id]);
                            }
                        }
                        ytp = menu.querySelectorAll("option");
                        i = ytp.length;
                        while (i--) {
                            if (user_settings[ytp[i].parentNode.id] === ytp[i].value) {
                                ytp[i].setAttribute("selected", "true");
                            }
                        }
                    }
                    return menu;
                }
                function getMenu(section) {
                    var temp = document.createElement("template");
                    if (section === "MEN") {
                        temp.innerHTML = //
                            `<div id='P-settings'>
                                <div id='P-container'>
                                    <div id='P-sidebar'>
                                        <ul id='P-sidebar-list'>
                                            <li id='GEN' class='selected' data-p='tnd|GEN'></li>
                                            <li id='VID' data-p='tnd|VID'></li>
                                            <li id='BLK' data-p='tnd|BLK'></li>
                                            <li id='ABT' data-p='tnd|ABT'></li>
                                            <li id='HLP'><a target='_blank' href='https://github.com/ParticleCore/Particle/wiki' data-p='tnd|HLP'></a></li>
                                            <li id='DNT'><a title='PayPal' target='_blank' href='https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UMVQJJFG4BFHW' data-p='tnd|DNT'></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>`;
                    } else if (section === "GEN") {
                        temp.innerHTML = //
                            `<div id='P-content'>
                                <div class='P-header'>
                                    <button class='P-save' data-p='tnd|GLB_SVE'></button>
                                    <button class='P-reset' data-p='tnd|GLB_RSET'></button>
                                    <button class='P-impexp ytplus_sprite' data-p='ttl|GLB_IMPR'></button>
                                    <button class='P-implang' data-p='ttl|GLB_LOCL_LANG&tnd|LOCALE'></button>
                                    <h2 data-p='tnd|GEN_TTL'></h2>
                                </div>
                                <hr class='P-horz'></hr>
                                <h3 data-p='tnd|GEN_GEN'></h3>
                                <div><input id='GEN_LOCL_LANG' type='checkbox'></input><label for='GEN_LOCL_LANG' data-p='tnd|GEN_LOCL_LANG'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#custom_lang' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_DSBL_ADS' type='checkbox'></input><label for='GEN_DSBL_ADS' data-p='tnd|GEN_DSBL_ADS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#outside_ads' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_YT_LOGO_LINK' type='checkbox'></input><label for='GEN_YT_LOGO_LINK' data-p='tnd|GEN_YT_LOGO_LINK'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#logo_redirect' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_SUB_LIST' type='checkbox'></input><label for='GEN_SUB_LIST' data-p='tnd|GEN_SUB_LIST'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#sub_playlist' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_INF_SCRL' type='checkbox'></input><label for='GEN_INF_SCRL' data-p='tnd|GEN_INF_SCRL'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#infinite_scroll' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_PPOT_ON' type='checkbox'></input><label for='GEN_PPOT_ON' data-p='tnd|GEN_PPOT_ON'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#popout_on' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_REM_APUN' type='checkbox'></input><label for='GEN_REM_APUN' data-p='tnd|GEN_REM_APUN'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#remove_autoplay' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_SPF_OFF' type='checkbox'></input><label for='GEN_SPF_OFF' data-p='tnd|GEN_SPF_OFF'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#spf_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div>
                                    <label for='GEN_CHN_DFLT_PAGE' data-p='tnd|GEN_CHN_DFLT_PAGE'></label>
                                    <div class='P-select'>
                                        <select id='GEN_CHN_DFLT_PAGE'>
                                            <option value='default' data-p='tnd|GEN_CHN_DFLT_PAGE_DFLT'></option>
                                            <option value='videos' data-p='tnd|GEN_CHN_DFLT_PAGE_VID'></option>
                                            <option value='playlists' data-p='tnd|GEN_CHN_DFLT_PAGE_PL'></option>
                                            <option value='channels' data-p='tnd|GEN_CHN_DFLT_PAGE_CHN'></option>
                                            <option value='discussion' data-p='tnd|GEN_CHN_DFLT_PAGE_DISC'></option>
                                            <option value='about' data-p='tnd|GEN_CHN_DFLT_PAGE_ABT'></option>
                                        </select>
                                    </div>\n
                                    <a href='https://github.com/ParticleCore/Particle/wiki/Features#channel_page' data-p='ttl|FTR_DESC' target='features'>?</a>
                                </div>
                                <h3 data-p='tnd|GEN_LYT'></h3>
                                <div><input id='GEN_GRID_SUBS' type='checkbox'></input><label for='GEN_GRID_SUBS' data-p='tnd|GEN_GRID_SUBS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#sub_grid' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_GRID_SRCH' type='checkbox'></input><label for='GEN_GRID_SRCH' data-p='tnd|GEN_GRID_SRCH'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#search_grid' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_BTTR_NTF' type='checkbox'></input><label for='GEN_BTTR_NTF' data-p='tnd|GEN_BTTR_NTF'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#blue_box' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_DSB_HVRC' type='checkbox'></input><label for='GEN_DSB_HVRC' data-p='tnd|GEN_DSB_HVRC'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#hovercards_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_CMPT_TTLS' type='checkbox'></input><label for='GEN_CMPT_TTLS' data-p='tnd|GEN_CMPT_TTLS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#feed_titles' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_BLUE_GLOW' type='checkbox'></input><label for='GEN_BLUE_GLOW' data-p='tnd|GEN_BLUE_GLOW'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#blue_glow' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_HIDE_FTR' type='checkbox'></input><label for='GEN_HIDE_FTR' data-p='tnd|GEN_HIDE_FTR'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#hide_footer' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_HDE_RECM_SDBR' type='checkbox'></input><label for='GEN_HDE_RECM_SDBR' data-p='tnd|GEN_HDE_RECM_SDBR'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#hide_recom_sidebar' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_HDE_SRCH_SDBR' type='checkbox'></input><label for='GEN_HDE_SRCH_SDBR' data-p='tnd|GEN_HDE_SRCH_SDBR'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#hide_search_sidebar' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='GEN_HDE_CHN_SDBR' type='checkbox'></input><label for='GEN_HDE_CHN_SDBR' data-p='tnd|GEN_HDE_CHN_SDBR'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#hide_channel_sidebar' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                            </div>`;
                        if (user_settings.GEN_LOCL_LANG && user_settings.localLang) {
                            temp.content.querySelector(".P-implang").dataset.p = "GLB_LOCL_LANG_CSTM";
                        }
                    } else if (section === "VID") {
                        temp.innerHTML = //
                            `<div id='P-content'>
                                <div class='P-header'>
                                    <button class='P-save' data-p='tnd|GLB_SVE'></button>
                                    <button class='P-reset' data-p='tnd|GLB_RSET'></button>
                                    <button class='P-impexp ytplus_sprite' data-p='ttl|GLB_IMPR'></button>
                                    <button class='P-implang' data-p='ttl|GLB_LOCL_LANG&tnd|LOCALE'></button>
                                    <h2 data-p='tnd|VID_TTL'></h2>
                                </div>
                                <hr class='P-horz'></hr>
                                <h3 data-p='tnd|VID_PLR'></h3>
                                <div><input id='VID_PLR_ADS' type='checkbox'></input><label for='VID_PLR_ADS' data-p='tnd|VID_PLR_ADS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#video_ads' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_SUB_ADS' type='checkbox'></input><label for='VID_SUB_ADS' data-p='tnd|VID_SUB_ADS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#subs_ads_on' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_ALVIS' type='checkbox'></input><label for='VID_PLR_ALVIS' data-p='tnd|VID_PLR_ALVIS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#floating_player' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_ALVIS_WDTH' type='text' placeholder='350' size='6'></input><label for='VID_PLR_ALVIS_WDTH' data-p='tnd|VID_PLR_ALVIS_WDTH'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#floating_player_width' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_ATPL' type='checkbox'></input><label for='VID_PLR_ATPL' data-p='tnd|VID_PLR_ATPL'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#video_autoplay' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_CC' type='checkbox'></input><label for='VID_PLR_CC' data-p='tnd|VID_PLR_CC'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#subtitles_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_ANTS' type='checkbox'></input><label for='VID_PLR_ANTS' data-p='tnd|VID_PLR_ANTS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#annotations_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_END_SHRE' type='checkbox'></input><label for='VID_END_SHRE' data-p='tnd|VID_END_SHRE'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#share_panel_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_VOL_MEM' type='checkbox'></input><label for='VID_PLR_VOL_MEM' data-p='tnd|VID_PLR_VOL_MEM'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#remember_volume' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_VOL_LDN' type='checkbox'></input><label for='VID_PLR_VOL_LDN' data-p='tnd|VID_PLR_VOL_LDN'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#disable_normalisation' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_ALACT' type='checkbox'></input><label for='VID_PLR_ALACT' data-p='tnd|VID_PLR_ALACT'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#shortcuts_on' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_SIZE_MEM' type='checkbox'></input><label for='VID_PLR_SIZE_MEM' data-p='tnd|VID_PLR_SIZE_MEM'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#remember_mode' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_VOL_WHEEL' type='checkbox'></input><label for='VID_VOL_WHEEL' data-p='tnd|VID_VOL_WHEEL'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#wheel_volume' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_DASH' type='checkbox'></input><label for='VID_PLR_DASH' data-p='tnd|VID_PLR_DASH'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#dash_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_HFR' type='checkbox'></input><label for='VID_PLR_HFR' data-p='tnd|VID_PLR_HFR'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#hfr_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_HTML5' type='checkbox'></input><label for='VID_PLR_HTML5' data-p='tnd|VID_PLR_HTML5'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#force_html5' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div>
                                    <label for='VID_DFLT_QLTY' data-p='tnd|VID_DFLT_QLTY'></label>
                                    <div class='P-select'>
                                        <select id='VID_DFLT_QLTY'>
                                            <option value='auto' data-p='tnd|VID_DFLT_QLTY_AUTO'></option>
                                            <option value='highres' data-p='tnd|VID_DFLT_QLTY_ORIG'></option>
                                            <option value='hd2880' data-p='tnd|VID_DFLT_QLTY_2880'></option>
                                            <option value='hd2160' data-p='tnd|VID_DFLT_QLTY_2160'></option>
                                            <option value='hd1440' data-p='tnd|VID_DFLT_QLTY_1440'></option>
                                            <option value='hd1080' data-p='tnd|VID_DFLT_QLTY_1080'></option>
                                            <option value='hd720' data-p='tnd|VID_DFLT_QLTY_720'></option>
                                            <option value='large' data-p='tnd|VID_DFLT_QLTY_LRG'></option>
                                            <option value='medium' data-p='tnd|VID_DFLT_QLTY_MDM'></option>
                                            <option value='small' data-p='tnd|VID_DFLT_QLTY_SML'></option>
                                            <option value='tiny' data-p='tnd|VID_DFLT_QLTY_TNY'></option>
                                        </select>
                                    </div>\n
                                    <a href='https://github.com/ParticleCore/Particle/wiki/Features#default_quality' data-p='ttl|FTR_DESC' target='features'>?</a>
                                </div>
                                <h3 data-p='tnd|VID_PLR_LYT'></h3>
                                <div><input id='VID_PLR_INFO' type='checkbox'></input><label for='VID_PLR_INFO' data-p='tnd|VID_PLR_INFO'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#info_bar' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_DYN_SIZE' type='checkbox'></input><label for='VID_PLR_DYN_SIZE' data-p='tnd|VID_PLR_DYN_SIZE'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#dynamic_size_off' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_FIT' type='checkbox'></input><label for='VID_PLR_FIT' data-p='tnd|VID_PLR_FIT'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#fit_to_page' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLR_FIT_WDTH' type='text' placeholder='1280px' size='6'></input><label for='VID_PLR_FIT_WDTH' data-p='tnd|VID_PLR_FIT_WDTH'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#fit_max_width' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <h3 data-p='tnd|VID_PLST'></h3>
                                <div><input id='VID_PLST_ATPL' type='checkbox'></input><label for='VID_PLST_ATPL' data-p='tnd|VID_PLST_ATPL'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#playlist_autoplay' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_PLST_RVRS' type='checkbox'></input><label for='VID_PLST_RVRS' data-p='tnd|VID_PLST_RVRS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#playlist_reverse' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <h3 data-p='tnd|VID_LAYT'></h3>
                                <div><input id='VID_PPOT_SZ' type='text' placeholder='533' size='6'></input><label for='VID_PPOT_SZ' data-p='tnd|VID_PPOT_SZ'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#popout_size' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div>
                                    <label for='VID_HIDE_COMS' data-p='tnd|VID_HIDE_COMS'></label>
                                    <div class='P-select'>
                                        <select id='VID_HIDE_COMS'>
                                            <option value='0' data-p='tnd|VID_HIDE_COMS_SHOW'></option>
                                            <option value='1' data-p='tnd|VID_HIDE_COMS_HIDE'></option>
                                            <option value='2' data-p='tnd|VID_HIDE_COMS_REM'></option>
                                        </select>
                                    </div>\n
                                    <a href='https://github.com/ParticleCore/Particle/wiki/Features#comments' data-p='ttl|FTR_DESC' target='features'>?</a>
                                </div>
                                <div><input id='VID_TTL_CMPT' type='checkbox'></input><label for='VID_TTL_CMPT' data-p='tnd|VID_TTL_CMPT'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#video_title' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_DESC_SHRT' type='checkbox'></input><label for='VID_DESC_SHRT' data-p='tnd|VID_DESC_SHRT'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#labelless_buttons' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_VID_CNT' type='checkbox'></input><label for='VID_VID_CNT' data-p='tnd|VID_VID_CNT'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#upload_counter' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_POST_TIME' type='checkbox'></input><label for='VID_POST_TIME' data-p='tnd|VID_POST_TIME'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#relative_upload_time' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_HIDE_DETLS' type='checkbox'></input><label for='VID_HIDE_DETLS' data-p='tnd|VID_HIDE_DETLS'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#hide_video_details' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div><input id='VID_LAYT_AUTO_PNL' type='checkbox'></input><label for='VID_LAYT_AUTO_PNL' data-p='tnd|VID_LAYT_AUTO_PNL'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#expand_description' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                            </div>`;
                        if (user_settings.GEN_LOCL_LANG && user_settings.localLang) {
                            temp.content.querySelector(".P-implang").dataset.p = "GLB_LOCL_LANG_CSTM";
                        }
                    } else if (section === "BLK") {
                        temp.innerHTML = //
                            `<div id='P-content'>
                                <div class='P-header'>
                                    <button class='P-save' data-p='tnd|GLB_SVE'></button>
                                    <button class='P-reset' data-p='tnd|GLB_RSET'></button>
                                    <button class='P-impexp ytplus_sprite' data-p='ttl|GLB_IMPR'></button>
                                    <button class='P-implang' data-p='ttl|GLB_LOCL_LANG&tnd|LOCALE'></button>
                                    <h2 data-p='tnd|BLK_TTL'></h2>
                                </div>
                                <hr class='P-horz'></hr>
                                <h3 data-p='tnd|BLK_BLK'></h3>
                                <div><input id='BLK_ON' type='checkbox'></input><label for='BLK_ON' data-p='tnd|BLK_ON'></label>\n<a href='https://github.com/ParticleCore/Particle/wiki/Features#blacklist_on' data-p='ttl|FTR_DESC' target='features'>?</a></div>
                                <div id='blacklist'>
                                    <div id='blacklist-controls'>
                                        <button id='blacklist-edit' class='yt-uix-button yt-uix-sessionlink yt-uix-button-default yt-uix-button-size-default'><span class='yt-uix-button-content' data-p='tnd|BLCK_EDIT'></span></button>
                                        <button id='blacklist-save' class='yt-uix-button yt-uix-sessionlink yt-uix-button-default yt-uix-button-size-default'><span class='yt-uix-button-content' data-p='tnd|BLCK_SAVE'></span></button>
                                        <button id='blacklist-close' class='yt-uix-button yt-uix-sessionlink yt-uix-button-default yt-uix-button-size-default'><span class='yt-uix-button-content' data-p='tnd|BLCK_CLSE'></span></button>
                                    </div>
                                    <textarea id='blacklist-edit-list'></textarea>
                                </div>
                                <br></br>
                            </div>`;
                        if (user_settings.GEN_LOCL_LANG && user_settings.localLang) {
                            temp.content.querySelector(".P-implang").dataset.p = "ttl|GLB_LOCL_LANG&tnd|GLB_LOCL_LANG_CSTM";
                        }
                    } else if (section === "ABT") {
                        temp.innerHTML = //
                            `<div id='P-content'>
                                <div class='P-header'>
                                    <h2 data-p='tnd|ABT_TTL'></h2>
                                </div>
                                <hr class='P-horz'></hr>
                                <h3 data-p='tnd|ABT_THKS'></h3>
                                <div><a target='_blank' href='https://github.com/YePpHa'>Jeppe Rune Mortensen</a><span data-p='tnd|ABT_THKS_YEPPHA'></span></div>
                                <div><a target='_blank' href='http://www.greasespot.net/'>Greasemonkey</a> + <a href='http://tampermonkey.net/'>Tampermonkey</a><span data-p='tnd|ABT_THKS_USERSCRIPT'></span></div>
                                <div><a target='_blank' href='http://stackoverflow.com/'>Stack Overflow</a><span data-p='tnd|ABT_THKS_STACKOV'></span></div>
                                <h3 data-p='tnd|ABT_INFO'></h3>
                                <div><a target='_blank' href='https://github.com/ParticleCore/Particle/'>GitHub</a></div>
                                <div><a target='_blank' href='https://greasyfork.org/en/users/8223-particlecore'>Greasy Fork</a></div>
                                <div><a target='_blank' href='http://openuserjs.org/scripts/ParticleCore/'>OpenUserJS</a></div>
                            </div>`;
                    }
                    return setLocale(getValues(temp.content));
                }
                function exportSettings(target) {
                    var expCont;
                    if (target.classList.contains("P-impexp") || target.classList.contains("P-implang")) {
                        expCont = document.getElementById("exp-cont");
                        if (expCont) {
                            expCont.remove();
                            return;
                        }
                        expCont = document.createElement("template");
                        expCont.innerHTML = //
                            `<div id='exp-cont'>
                               <button id='implang-save' class='yt-uix-button yt-uix-sessionlink yt-uix-button-default yt-uix-button-size-default'>
                                    <span class='yt-uix-button-content' data-p='tnd|GLB_IMPR_SAVE'></span>
                                </button>
                               <textarea id='impexp-list'></textarea>
                            </div>`;
                        if (target.classList.contains("P-impexp")) {
                            expCont.content.querySelector("#implang-save").id = "impexp-save";
                        }
                        expCont = setLocale(expCont.content).firstChild;
                        document.getElementById("P-content").appendChild(expCont);
                        document.getElementById("impexp-list").value = JSON.stringify((target.classList.contains("P-impexp") && user_settings) || user_settings.localLang || language, undefined, 2);
                    } else if (target.id === "impexp-save" || target.id === "implang-save") {
                        if (target.id === "implang-save") {
                            set("localLang", JSON.parse(document.getElementById("impexp-list").value));
                            window.location.reload();
                        } else {
                            set("user_settings", JSON.parse(document.getElementById("impexp-list").value));
                            settingsMenu.settingsButton.click();
                            settingsMenu.settingsButton.click();
                        }
                    }
                }
                function setBlackList(target) {
                    if (target.id === "blacklist-edit") {
                        document.getElementById("blacklist").classList.add("edit");
                        document.getElementById("blacklist-edit-list").value = JSON.stringify(user_settings.blacklist, undefined, 2);
                    } else if (target.id === "blacklist-save") {
                        set("blacklist", JSON.parse(document.getElementById("blacklist-edit-list").value));
                    } else if (target.id === "blacklist-close") {
                        document.getElementById("BLK").click();
                    }
                }
                function delBlackList() {
                    var newKey = user_settings.blacklist;
                    delete newKey[event.target.nextSibling.href.split("/channel/")[1]];
                    event.target.parentNode.remove();
                    set("blacklist", newKey);
                }
                function saveSettings(salt) {
                    var i, value, notification, navId, userSets, savedSets;
                    navId = document.querySelector(".selected").id;
                    userSets = document.getElementById("P-content").querySelectorAll("[id^='" + navId + "']");
                    savedSets = user_settings;
                    i = userSets.length;
                    while (i--) {
                        value = (userSets[i].checked && (userSets[i].value === "on" || userSets[i].value)) || (userSets[i].length && userSets[i].value) || (userSets[i].getAttribute("type") === "text" && userSets[i].value);
                        if (value) {
                            savedSets[userSets[i].name || userSets[i].id] = value;
                        } else if (!value && userSets[i].type !== "radio") {
                            savedSets[userSets[i].id] = false;
                        }
                    }
                    set("user_settings", savedSets);
                    customStyles();
                    if (!salt) {
                        notification = document.getElementById("appbar-main-guide-notification-container");
                        if (notification.childNodes.length < 1) {
                            notification.remove();
                            notification = document.createElement("template");
                            notification.innerHTML = //
                                `<div id='appbar-main-guide-notification-container'>
                                    <div class='appbar-guide-notification' role='alert'>
                                        <span class='appbar-guide-notification-content-wrapper yt-valign'>
                                            <span class='appbar-guide-notification-icon yt-sprite'></span>
                                            <span class='appbar-guide-notification-text-content'></span>
                                        </span>
                                    </div>
                                </div>`;
                            notification = setLocale(notification.content).firstChild;
                            document.querySelector(".yt-masthead-logo-container").appendChild(notification);
                        }
                        document.querySelector(".appbar-guide-notification-text-content").textContent = lang("GLB_SVE_SETS");
                        document.body.classList.add("show-guide-button-notification");
                        window.setTimeout(() => document.body.classList.remove("show-guide-button-notification"), 2000);
                    }
                }
                function navigateSettings(event) {
                    if (event.target.classList.contains("P-save")) {
                        saveSettings();
                    } else if (event.target.classList.contains("P-reset")) {
                        set("user_settings", default_settings);
                        settingsMenu.settingsButton.click();
                        settingsMenu.settingsButton.click();
                    } else if (event.target.classList.contains("close")) {
                        delBlackList();
                    } else if (event.target.classList.contains("P-impexp") || event.target.id === "impexp-save" || event.target.classList.contains("P-implang") || event.target.id === "implang-save") {
                        exportSettings(event.target);
                    } else if (event.target.id === "blacklist-edit" || event.target.id === "blacklist-save" || event.target.id === "blacklist-close") {
                        setBlackList(event.target);
                    } else if (event.target.id === "P-container" || event.target.id === "P-settings") {
                        event = (event.target.id === "P-settings") ? event.target : event.target.parentNode;
                        event.remove();
                    } else if (event.target.id !== "DNT" && event.target.tagName !== "A" && event.target.parentNode.id === "P-sidebar-list") {
                        saveSettings("no-notification");
                        document.getElementById("P-content").remove();
                        document.getElementById("P-container").appendChild(getMenu(event.target.id));
                        event.target.parentNode.querySelector(".selected").removeAttribute("class");
                        event.target.className = "selected";
                    }
                }
                function settingsTemplate(event) {
                    var pWrapper;
                    if (event.target.id === "P" && event.target.tagName !== "INPUT") {
                        pWrapper = document.getElementById("P-settings");
                        if (pWrapper) {
                            pWrapper.remove();
                        } else {
                            pWrapper = getMenu("MEN");
                            pWrapper.querySelector("#P-container").appendChild(getMenu("GEN"));
                            document.getElementById("body-container").insertBefore(pWrapper, document.getElementById("page-container"));
                            eventHandler([document, "click", navigateSettings]);
                        }
                        document[(window.chrome && "body") || "documentElement"].scrollTop = 0;
                    }
                }
                function firstTime(event) {
                    if (event && event.target && event.target.parentNode && event.target.parentNode.className === "par_closewlcm") {
                        set("firstTime", false);
                        eventHandler([settingsMenu.welcome, "click", firstTime, false, "remove"]);
                        settingsMenu.welcome.style.display = "none";
                    }
                }
                var notif_button, settings_button, welcome_message;
                if (settingsMenu.settingsButton) {
                    return;
                }
                notif_button = document.querySelector(".notifications-container");
                settings_button = document.querySelector("#yt-masthead-user, #yt-masthead-signin");
                if (settings_button) {
                    welcome_message = document.createElement("template");
                    welcome_message.innerHTML = //
                        `<div id='Psettings' style='display:inline-block;position:relative'>
                           <button id='P' class='ytplus_sprite' data-p='ttl|YTSETS'></button>
                           <div id='part_welcome' style='display:none;margin-left:-220px;top:38px;right:0'>
                               <span data-p='tnd|WLCM'></span>
                               <br></br>
                               <span data-p='tnd|WLCMSTRT'></span>
                               <br></br><br></br>
                               <a data-p='tnd|WLCMFTRS' style='color:#FFF;' href='https://github.com/ParticleCore/Particle/wiki/Features' target='_blank'></a>
                               <div class='par_closewlcm'><span>×</span></div>
                           </div>
                        </div>`;
                    welcome_message = setLocale(welcome_message.content);
                    eventHandler([document, "click", settingsTemplate]);
                    if (notif_button) {
                        settings_button.insertBefore(welcome_message, notif_button);
                    } else {
                        settings_button.appendChild(welcome_message);
                    }
                    settingsMenu.settingsButton = document.getElementById("P");
                    settingsMenu.welcome = document.getElementById("part_welcome");
                    if (user_settings.firstTime) {
                        settingsMenu.welcome.style.display = "block";
                        eventHandler([settingsMenu.welcome, "click", firstTime]);
                    }
                }
            }
            function scriptExit(event) {
                function modComment(original) {
                    return function (a) {
                        var comments, is_live;
                        comments = document.getElementById("watch-discussion");
                        is_live = window.ytplayer && window.ytplayer.config && window.ytplayer.config.args && window.ytplayer.config.args.livestream;
                        if (a.split("comments").length > 1 && !is_live && comments && !comments.lazyload && user_settings.VID_HIDE_COMS === "1" && !comments.classList.contains("show")) {
                            comments.lazyload = arguments;
                        } else {
                            return original.apply(this, arguments);
                        }
                    };
                }
                function modSetConfig(original) {
                    return function (a) {
                        if (typeof a === "object") {
                            if ("SHARE_ON_VIDEO_END" in a) {
                                a.SHARE_ON_VIDEO_END = !user_settings.VID_END_SHRE;
                            }
                            if ("UNIVERSAL_HOVERCARDS" in a) {
                                a.UNIVERSAL_HOVERCARDS = !user_settings.GEN_DSB_HVRC;
                            }
                        }
                        original.apply(scriptExit, arguments);
                    };
                }
                function modEmbed(original) {
                    return function (a, b) {
                        var temp, player;
                        b = modArgs(b);
                        temp = original.apply(scriptExit, arguments);
                        player = document.getElementById("movie_player");
                        if (player) {
                            player.setPlaybackQuality(user_settings.VID_DFLT_QLTY);
                        }
                        return temp;
                    };
                }
                function modAutoplay(original) {
                    return function (a, b) {
                        if (!b || user_settings.plApl || (!user_settings.plApl && b.feature && b.feature !== "autoplay")) {
                            original.apply(scriptExit, arguments);
                        }
                    };
                }
                function modAutoplayFullscreen(original) {
                    return function () {
                        var has_ended, next_button, next_clicked;
                        has_ended = api && api.getCurrentTime && Math.round(api.getCurrentTime()) >= Math.floor(api.getDuration());
                        next_clicked = document.activeElement.classList.contains("ytp-button-next") || document.activeElement.classList.contains("ytp-next-button");
                        if (!user_settings.plApl && !next_clicked && has_ended) {
                            next_button = document.querySelector(".ytp-next-button");
                            if (next_button && next_button.getAttribute("aria-disabled") === "true") {
                                next_button.onclick = api.nextVideo;
                                eventHandler([document, "click", api.nextVideo]);
                                next_button.setAttribute("aria-disabled", "false");
                            }
                            return false;
                        }
                        if (user_settings.plApl || next_clicked || !has_ended) {
                            if (next_clicked) {
                                document.getElementById("movie_player").focus();
                            }
                            return original.apply(this, arguments);
                        }
                    };
                }
                function modPlayerCreate(original) {
                    return function (a, b) {
                        var player;
                        b = modArgs(b);
                        if (a.id === "upsell-video") {
                            original.apply(scriptExit, arguments);
                        } else if (typeof a === "object") {
                            player_instance = original.apply(scriptExit, arguments);
                            Object.keys(player_instance).some(keys => {
                                if (typeof player_instance[keys] === "object") {
                                    if (player_instance[keys] && player_instance[keys].hasNext) {
                                        player_instance[keys].hasNext = modAutoplayFullscreen(player_instance[keys].hasNext);
                                        return true;
                                    }
                                }
                            });
                            player = document.getElementById("movie_player");
                            if (!user_settings.VID_PLR_ATPL && player) {
                                if (window.ytplayer.config.args.dvmap && !user_settings.VID_PLR_ADS) {
                                    window.ytplayer.config.args.vmap = window.ytplayer.config.args.dvmap;
                                }
                                player.cueVideoByPlayerVars(window.ytplayer.config.args);
                            }
                        }
                    };
                }
                function setMods(keys) {
                    var str;
                    if (typeof window._yt_www[keys] === "function") {
                        str = String(window._yt_www[keys]);
                        if (str.split("player-added").length > 1) {
                            window._yt_www[keys] = modEmbed(window._yt_www[keys]);
                        } else if (str.split("window.spf.navigate").length > 1) {
                            window._yt_www[keys] = modAutoplay(window._yt_www[keys]);
                        } else if (str.split(".set(\"\"+a,b,c,\"/\",d").length > 1) {
                            window.ytpsetwide = window._yt_www[keys];
                        }
                    }
                }
                if (event && event.target) {
                    if (event.target.getAttribute("name") === "www/base") {
                        window.yt.setConfig = modSetConfig(window.yt.setConfig);
                        Object.keys(window._yt_www).forEach(setMods);
                    }
                    if (event.target.getAttribute("name") === "spf/spf") {
                        window.spf.load = modComment(window.spf.load);
                        window.spf.prefetch = () => {};
                        if (window.name === "popOut") {
                            window.spf.navigate = () => {};
                        }
                    }
                }
                if ((event && event.target && event.target.getAttribute("name") === "player/base") || (!window.html5Patched && window.yt && window.yt.player && window.yt.player.Application && window.yt.player.Application.create)) {
                    window.html5Patched = true;
                    window.yt.player.Application.create = modPlayerCreate(window.yt.player.Application.create);
                }
            }
            function alwaysVisible() {
                function checkBounds(elm, X, Y) {
                    return {
                        X: (((X > -1 && (X + elm.offsetWidth) < document.documentElement.offsetWidth) && X) || (X < 1 && "0") || (document.documentElement.offsetWidth - elm.offsetWidth)),
                        Y: (((Y > 51 && (Y + elm.offsetHeight) < document.documentElement.offsetHeight) && Y) || (Y < 52 && 52) || (document.documentElement.offsetHeight - elm.offsetHeight))
                    };
                }
                function updatePos() {
                    var height, player, bounds;
                    if (!document.documentElement.classList.contains("floater")) {
                        return eventHandler([window, "resize", updatePos, false, "remove"]);
                    }
                    height = parseInt(user_settings.VID_PLR_ALVIS_WDTH) || 350;
                    player = document.getElementById("movie_player");
                    bounds = checkBounds(player, user_settings.floaterX, user_settings.floaterY);
                    height = (height < 350 ? 350 : height) / (16 / 9);
                    player.setAttribute("style", "width:" + (height * (16 / 9)) + "px;height:" + height + "px;left:" + bounds.X + "px;top:" + bounds.Y + "px");
                }
                function dragFloater(event) {
                    var excluded, isFScreen, isFloater, bounds, player;
                    isFScreen = document.querySelector(".ytp-fullscreen");
                    isFloater = document.documentElement.classList.contains("floater");
                    if (event && !isFScreen && isFloater) {
                        if (event.type === "click" && event.target.id === "part_floaterui_scrolltop") {
                             document[(window.chrome && "body") || "documentElement"].scrollTop = 0;
                        } else {
                            player = document.getElementById("movie_player");
                            if (event.buttons === 1) {
                                excluded = document.querySelector(".ytp-chrome-bottom");
                                if (event.type === "mousedown" && player.contains(event.target) && (!excluded || !excluded.contains(event.target))) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    eventHandler([document, "mousemove", dragFloater, false]);
                                    eventHandler([document, "click", dragFloater, true]);
                                    window.oldPos = {
                                        X: parseInt(player.style.left) - event.clientX,
                                        Y: parseInt(player.style.top) - event.clientY,
                                        orgX: event.clientX,
                                        orgY: event.clientY
                                    };
                                } else if (event.type === "mousemove" && (window.hasMoved || Math.abs(event.clientX - window.oldPos.orgX) > 10 || Math.abs(event.clientY - window.oldPos.orgY) > 10)) {
                                    bounds = checkBounds(player, event.clientX + window.oldPos.X, event.clientY + window.oldPos.Y);
                                    player.style.left = bounds.X + "px";
                                    player.style.top = bounds.Y + "px";
                                    window.hasMoved = true;
                                }
                            }
                            if (event.buttons !== 1 || event.type === "click") {
                                if (window.hasMoved) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    delete window.oldPos;
                                    delete window.hasMoved;
                                    set("floaterX", parseInt(player.style.left));
                                    set("floaterY", parseInt(player.style.top));
                                }
                                eventHandler([document, "mousemove", dragFloater, false, "remove"]);
                                eventHandler([document, "click", dragFloater, true, "remove"]);
                            }
                        }
                    }
                }
                function initFloater() {
                    var player, plrApi, out_of_sight, isFloater, isFScreen, floaterUI;
                    player = document.getElementById("movie_player");
                    plrApi = document.getElementById("player-api").getBoundingClientRect();
                    if (player) {
                        out_of_sight = plrApi.bottom < ((plrApi.height / 2) + 52);
                        isFloater = document.documentElement.classList.contains("floater");
                        isFScreen = document.querySelector(".ytp-fullscreen");
                        floaterUI = document.getElementById("part_floaterui");
                        if (!floaterUI && !isFScreen) {
                            floaterUI = document.createElement("template");
                            floaterUI.innerHTML = //
                                `<div id='part_floaterui'>
                                    <button id='part_floaterui_scrolltop' class='ytplus_sprite' data-p='ttl|VID_PLR_ALVIS_SCRL_TOP'></button>
                                </div>`;
                            floaterUI = setLocale(floaterUI.content).firstChild;
                            eventHandler([document, "mousedown", dragFloater]);
                            player.appendChild(floaterUI);
                        }
                        if (out_of_sight && !isFloater) {
                            document.documentElement.classList.add("floater");
                            eventHandler([window, "resize", updatePos]);
                            updatePos();
                            window.dispatchEvent(new Event("resize"));
                        } else if (!out_of_sight && isFloater) {
                            document.documentElement.classList.remove("floater");
                            eventHandler([window, "resize", updatePos, false, "remove"]);
                            player.removeAttribute("style");
                            window.dispatchEvent(new Event("resize"));
                        }
                    }
                }
                if (user_settings.VID_PLR_ALVIS) {
                    if (window.location.pathname === "/watch") {
                        eventHandler([window, "scroll", initFloater]);
                    } else if (window.location.pathname !== "/watch") {
                        eventHandler([window, "scroll", initFloater, false, "remove"]);
                    }
                }
            }
            function playerReady() {
                function alwaysActive(event) {
                    var i, list, clear, length, eventClone;
                    clear = window.location.pathname == "/watch" && api && api !== event.target && !api.contains(event.target) && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && !event.target.isContentEditable;
                    if (clear && ((event.which > 47 && event.which < 58) || (event.which > 95 && event.which < 106) || [27, 32, 35, 36, 37, 38, 39, 40, 66, 67, 79, 87, 187, 189].indexOf(event.which) > -1) && ["EMBED", "INPUT", "OBJECT", "TEXTAREA", "IFRAME"].indexOf(document.activeElement.tagName) < 0) {
                        eventClone = new Event("keydown");
                        list = Object.keys(Object.getPrototypeOf(event));
                        length = list.length;
                        for (i = 0; i < length; i++) {
                            eventClone[list[i]] = event[list[i]];
                        }
                        event.preventDefault();
                        api.dispatchEvent(eventClone);
                    }
                }
                function playerState(event) {
                    if (user_settings.fullBrs || user_settings.lightsOut) {
                        document.documentElement.classList[(event < 5 && event > 0 && "add") || "remove"]((user_settings.fullBrs && "part_fullbrowser") || "0", (user_settings.lightsOut && "part_cinema_mode") || "0");
                    }
                    window.dispatchEvent(new Event("resize"));
                }
                function handleCustoms(event) {
                    if (typeof event === "object") {
                        set("volLev", event.volume);
                    } else {
                        set("theaterMode", event);
                    }
                }
                api = document.getElementById("movie_player");
                if (api && !document.getElementById("c4-player")) {
                    if (user_settings.fullBrs || user_settings.lightsOut) {
                        api.addEventListener("onStateChange", playerState);
                    }
                    if (user_settings.VID_PLR_VOL_MEM) {
                        api.addEventListener("onVolumeChange", handleCustoms);
                    }
                    if (user_settings.VID_PLR_SIZE_MEM) {
                        api.addEventListener("SIZE_CLICKED", handleCustoms);
                    }
                    if (user_settings.VID_PLR_VOL_MEM) {
                        api.setVolume(user_settings.volLev);
                    }
                    if (user_settings.loopVid) {
                        document.querySelector("video").loop = user_settings.loopVid;
                    }
                    if (user_settings.VID_PLR_ALACT) {
                        eventHandler([document, "keydown", alwaysActive]);
                    }
                }
            }
            function advancedOptions() {
                function togglePlay() {
                    set("VID_PLR_ATPL", !user_settings.VID_PLR_ATPL);
                    document.documentElement.classList[(user_settings.VID_PLR_ATPL && "add") || "remove"]("part_autoplayon");
                    document.getElementById("autoplay-button").classList[(user_settings.VID_PLR_ATPL && "add") || "remove"]("active");
                }
                function toggleLoop(event) {
                    var videoPlayer = document.querySelector("video");
                    if (videoPlayer) {
                        videoPlayer.loop = event ? !user_settings.loopVid : user_settings.loopVid;
                        if (event) {
                            advancedOptions.loop_button.classList[(!user_settings.loopVid && "add") || "remove"]("active");
                        }
                    }
                    set("loopVid", advancedOptions.loop_button.classList.contains("active"));
                }
                function getThumb() {
                    var args, base, thumb_url;
                    args = window.ytplayer.config.args;
                    base = (args.iurl_webp && "_webp") || "";
                    thumb_url = args["iurlmaxres" + base] || args["iurlsd" + base] || args["iurl" + base];
                    window.open(thumb_url);
                }
                function getScreenshot() {
                    var width, height, aspectRatio, video, container, canvas, close, context;
                    video = document.querySelector("video");
                    container = document.getElementById("screenshot-result") || document.createElement("div");
                    canvas = container.querySelector("canvas") || document.createElement("canvas");
                    context = canvas.getContext("2d");
                    aspectRatio = video.videoWidth / video.videoHeight;
                    width = video.videoWidth;
                    height = parseInt(width / aspectRatio, 10);
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(video, 0, 0, width, height);
                    if (!container.id) {
                        container.id = "screenshot-result";
                        container.appendChild(canvas);
                        close = document.createElement("div");
                        close.id = "close-screenshot";
                        close.textContent = lang("CNSL_SS_CLS");
                        eventHandler([document, "click", event => {
                            if (event.target.id === "close-screenshot") {
                                container.classList.toggle("invisible");
                            }
                        }]);
                        container.appendChild(close);
                        document.body.appendChild(container);
                    } else if (container.id && container.classList.contains("invisible")) {
                        container.classList.toggle("invisible");
                    }
                }
                function exitFullBrowser(key) {
                    if (document.documentElement.classList.contains("part_fullbrowser") && (key.keyCode === 27 || key.key === "Escape" || (key.target.className && key.target.className.split("ytp-size").length > 1))) {
                        toggleFullBrowser(key);
                        if (key.type === "click") {
                            eventHandler([document, "keydown", exitFullBrowser, false, "remove"]);
                            eventHandler([document, "click", exitFullBrowser, false, "remove"]);
                            key.target.click();
                        }
                    }
                }
                function toggleFullBrowser(event) {
                    var plrState = api && api.getPlayerState && api.getPlayerState();
                    plrState = plrState < 5 && plrState > 0;
                    document[(window.chrome && "body") || "documentElement"].scrollTop = 0;
                    eventHandler([document, "keydown", exitFullBrowser]);
                    eventHandler([document, "click", exitFullBrowser]);
                    set("fullBrs", event ? !user_settings.fullBrs : true);
                    advancedOptions.full_browser.classList[(user_settings.fullBrs && "add") || "remove"]("active");
                    if (event && (plrState || event.keyCode === 27 || event.key === "Escape")) {
                        document.documentElement.classList[(user_settings.fullBrs && "add") || "remove"]("part_fullbrowser");
                        window.dispatchEvent(new Event("resize"));
                    }
                }
                function toggleCinemaMode(event) {
                    var plrState = api && api.getPlayerState && api.getPlayerState() < 5 && api.getPlayerState() > 0;
                    set("lightsOut", event ? !user_settings.lightsOut : true);
                    advancedOptions.cinema_mode.classList[(user_settings.lightsOut && "add") || "remove"]("active");
                    if (event && plrState) {
                        document.documentElement.classList[(user_settings.lightsOut && "add") || "remove"]("part_cinema_mode");
                    }
                }
                function toggleFrames(event) {
                    var i, pi, fps, temp;
                    advancedOptions.frame_step = document.getElementById("framestep-button");
                    if (event && ["EMBED", "INPUT", "OBJECT", "TEXTAREA"].indexOf(document.activeElement.tagName) < 0 && event.target.tagName !== "IFRAME" && !event.target.getAttribute("contenteditable")) {
                        if ((event.keyCode === 37 || event.keyCode === 39) && event.shiftKey) {
                            pi = api.getVideoStats().fmt;
                            temp = window.ytplayer.config.args.adaptive_fmts.split(",");
                            i = temp.length;
                            while (i--) {
                                if (temp[i].indexOf("itag=" + pi) > 0) {
                                    advancedOptions.fps = parseInt(temp[i].match(/fps=([\d]+)/)[1]);
                                    break;
                                }
                            }
                            if (!advancedOptions.fps || advancedOptions.fps === 1) {
                                advancedOptions.fps = 30;
                            }
                            fps = ((event.keyCode < 39 && -1) || 1) * ((advancedOptions.fps < 2 && 30) || advancedOptions.fps);
                            if (fps && api) {
                                if (!document.querySelector("video").paused) {
                                    api.pauseVideo();
                                }
                                api.seekBy(1 / fps);
                            }
                            event.preventDefault();
                            event.stopImmediatePropagation();
                        } else if (event.type === "click" && event.target.id === "framestep-button") {
                            set("frame_step", !user_settings.frame_step);
                            advancedOptions.frame_step.classList[(user_settings.frame_step && "add") || "remove"]("active");
                        }
                    }
                    if (advancedOptions.frame_step && advancedOptions.frame_step.classList.contains("active")) {
                        eventHandler([document, "keydown", toggleFrames, true]);
                    } else if (!advancedOptions.frame_step || !advancedOptions.frame_step.classList.contains("active")) {
                        eventHandler([document, "keydown", toggleFrames, true, "remove"]);
                    }
                }
                function handleToggles(event) {
                    if (event.target.dataset && event.target.dataset.action) {
                        advancedOptions.actions[event.target.dataset.action](event);
                    }
                }
                function hookButtons() {
                    advancedOptions.popPlayer = popPlayer;
                    advancedOptions.full_browser = advancedOptions.controls.querySelector("#fullbrowser-button");
                    advancedOptions.cinema_mode = advancedOptions.controls.querySelector("#cinemamode-button");
                    advancedOptions.loop_button = advancedOptions.controls.querySelector("#loop-button");
                    advancedOptions.frame_step = advancedOptions.controls.querySelector("#framestep-button");
                    advancedOptions.actions = {
                        togglePlay: togglePlay,
                        toggleLoop: toggleLoop,
                        getThumb: getThumb,
                        getScreenshot: getScreenshot,
                        popPlayer: popPlayer,
                        toggleFullBrowser: toggleFullBrowser,
                        toggleCinemaMode: toggleCinemaMode,
                        toggleFrames: toggleFrames
                    };
                    eventHandler([document, "click", handleToggles]);
                    if (user_settings.loopVid && !advancedOptions.loop_button.classList.contains("active")) {
                        advancedOptions.loop_button.classList.add("active");
                        toggleLoop();
                    }
                    if (user_settings.fullBrs && !advancedOptions.full_browser.classList.contains("active")) {
                        advancedOptions.full_browser.classList.add("active");
                        toggleFullBrowser();
                    }
                    if (user_settings.lightsOut && !advancedOptions.cinema_mode.classList.contains("active")) {
                        advancedOptions.cinema_mode.classList.add("active");
                        toggleCinemaMode();
                    }
                    if (user_settings.frame_step && !advancedOptions.frame_step.classList.contains("active")) {
                        advancedOptions.frame_step.classList.add("active");
                        toggleFrames();
                    }
                }
                function toggleConsole(event) {
                    if (event.target.id === "console-button") {
                        document.documentElement.classList.toggle("player-console");
                        event.target.classList[document.documentElement.classList.contains("player-console") ? "add" : "remove"]("close");
                        set("advOpts", document.documentElement.classList.contains("player-console"));
                    }
                }
                var header, cnslBtn, cnslCont;
                header = document.getElementById("watch-header");
                cnslBtn = document.getElementById("console-button");
                advancedOptions.controls = document.getElementById("player-console");
                if (window.location.pathname === "/watch" && header && !cnslBtn) {
                    cnslBtn = document.createElement("template");
                    cnslBtn.innerHTML = "<button id='console-button' class='ytplus_sprite' data-p='ttl|ADV_OPTS'></button>";
                    cnslBtn = setLocale(cnslBtn.content).firstChild;
                    eventHandler([document, "click", toggleConsole]);
                    cnslCont = document.createElement("template");
                    cnslCont.innerHTML = "<div id='advanced-options'></div>";
                    cnslCont = cnslCont.content.firstChild;
                    cnslCont.appendChild(cnslBtn);
                    header.appendChild(cnslCont);
                    if (advancedOptions.controls) {
                        advancedOptions.controls.remove();
                    }
                    advancedOptions.controls = document.createElement("template");
                    advancedOptions.controls.innerHTML = //
                        `<div id='player-console'>
                            <div id='autoplay-button' class='yt-uix-tooltip' data-p='ttp|CNSL_AP' data-action='togglePlay'></div>
                            <div id='loop-button' class='yt-uix-tooltip' data-p='ttp|CNSL_RPT' data-action='toggleLoop'></div>
                            <div id='save-thumbnail-button' class='yt-uix-tooltip' data-p='ttp|CNSL_SVTH' data-action='getThumb'></div>
                            <div id='screenshot-button' class='yt-uix-tooltip' data-p='ttp|CNSL_SS' data-action='getScreenshot'></div>
                            <div id='popout-button' class='yt-uix-tooltip' data-p='ttp|CNSL_PPOT' data-action='popPlayer'></div>
                            <div id='fullbrowser-button' class='yt-uix-tooltip' data-p='ttp|CNSL_FLBR' data-action='toggleFullBrowser'></div>
                            <div id='cinemamode-button' class='yt-uix-tooltip' data-p='ttp|CNSL_CINM_MD' data-action='toggleCinemaMode'></div>
                            <div id='framestep-button' class='yt-uix-tooltip' data-p='ttp|CNSL_FRME' data-action='toggleFrames'></div>
                        </div>`;
                    if (user_settings.VID_PLR_ATPL) {
                        advancedOptions.controls.content.querySelector("#autoplay-button").classList.add("active");
                    }
                    advancedOptions.controls = setLocale(advancedOptions.controls.content).firstChild;
                    cnslCont.appendChild(advancedOptions.controls);
                    hookButtons();
                    if (user_settings.advOpts) {
                        document.documentElement.classList.add("player-console");
                        cnslBtn.classList.add("close");
                    }
                }
            }
            function modThumbs() {
                function iniAction(event) {
                    var observer, load_more, click_title;
                    load_more = document.querySelector("#watch-more-related, .load-more-button");
                    click_title = document.querySelector(".yt-uix-tile");
                    while (click_title) {
                        click_title.classList.remove("yt-uix-tile");
                        click_title = document.querySelector(".yt-uix-tile");
                    }
                    if (load_more && !load_more.classList.contains("modThumbs")) {
                        load_more.classList.add("modThumbs");
                        observer = new MutationObserver(modThumbs);
                        observer.observe(load_more, {
                            childList: true,
                            attributes: true,
                            attributeOldValue: true
                        });
                    }
                    if (event && /popoutmode|blacklist/.test(event.target.className)) {
                        event.preventDefault();
                        event = event.target;
                        if (event.classList.contains("popoutmode")) {
                            popPlayer(event.dataset.link);
                        } else {
                            user_settings.blacklist[event.dataset.ytid] = event.dataset.user;
                            set("blacklist", user_settings.blacklist);
                            modThumbs();
                        }
                    }
                }
                function setButtons() {
                    var i, j, list, temp, thumb, button;
                    list = Object.keys(modThumbs.thumbs);
                    i = list.length;
                    while (i--) {
                        temp = modThumbs.thumbs[list[i]];
                        j = temp.length;
                        while (j--) {
                            thumb = temp[j].querySelector(".yt-lockup-thumbnail, .thumb-wrapper");
                            if (thumb) {
                                if (user_settings.GEN_PPOT_ON && !thumb.querySelector(".popoutmode") && !/channel/.test(temp[j].firstChild.className)) {
                                    button = document.createElement("template");
                                    button.innerHTML = "<div data-p='ttl|PPOT_OPEN&ttp|PPOT_OPEN' class='yt-uix-tooltip popoutmode ytplus_sprite'></div>";
                                    button.content.firstChild.dataset.link = temp[j].querySelector("a[href*='/watch?v']").href;
                                    thumb.appendChild(setLocale(button.content).firstChild);
                                }
                                if (user_settings.BLK_ON && !thumb.querySelector(".blacklist")) {
                                    button = document.createElement("template");
                                    button.innerHTML = "<div data-p='ttl|BLCK_ADD&ttp|BLCK_ADD' class='yt-uix-tooltip blacklist ytplus_sprite'></div>";
                                    button.content.firstChild.dataset.user = temp[j].username;
                                    button.content.firstChild.dataset.ytid = list[i];
                                    thumb.appendChild(setLocale(button.content).firstChild);
                                }
                            }
                        }
                    }
                }
                function delVideos() {
                    var i, j, temp, parent, blacklist;
                    blacklist = Object.keys(user_settings.blacklist);
                    i = blacklist.length;
                    while (i--) {
                        temp = modThumbs.thumbs[blacklist[i]];
                        if (temp) {
                            j = temp.length;
                            while (j--) {
                                parent = temp[j].parentNode;
                                temp[j].remove();
                                temp.splice(j, 1);
                                while (parent) {
                                    if (parent.childElementCount) {
                                        break;
                                    }
                                    parent = parent.parentNode;
                                    parent.firstChild.remove();
                                }
                            }
                            if (!temp.length) {
                                delete modThumbs.thumbs[blacklist[i]];
                            }
                            temp = false;
                        }
                    }
                    temp = document.getElementsByClassName("feed-item-container");
                    i = temp.length;
                    while (i--) {
                        if (temp[i].querySelectorAll("ul").length < 2) {
                            parent = temp[i].parentNode;
                            temp[i].remove();
                            while (parent) {
                                if (parent.childElementCount) {
                                    break;
                                }
                                parent = parent.parentNode;
                                parent.firstChild.remove();
                            }
                        }
                    }
                }
                function getVideos() {
                    var i, list, temp, channel_id;
                    modThumbs.thumbs = {};
                    list = document.querySelectorAll(`
                        .yt-lockup-byline > a,
                        .yt-lockup-thumbnail > .g-hovercard,
                        .video-list-item .g-hovercard
                    `);
                    i = list.length;
                    while (i--) {
                        temp = list[i];
                        channel_id = temp.dataset.ytid;
                        while (temp) {
                            if (temp.tagName && temp.tagName === "LI") {
                                temp.username = list[i].textContent;
                                if (!modThumbs.thumbs[channel_id]) {
                                    modThumbs.thumbs[channel_id] = [temp];
                                } else if (modThumbs.thumbs[channel_id].indexOf(temp) < 0) {
                                    modThumbs.thumbs[channel_id].push(temp);
                                }
                                break;
                            }
                            temp = temp.parentNode;
                        }
                    }
                }
                if ((user_settings.BLK_ON || user_settings.GEN_PPOT_ON) && !window.opener && window.yt && window.yt.config_ && /watch|index|feed|channel|results/.test(window.yt.config_.PAGE_NAME)) {
                    getVideos();
                    if (user_settings.BLK_ON && window.yt.config_.PAGE_NAME !== "channel") {
                        delVideos();
                    }
                    setButtons();
                    eventHandler([document, "click", iniAction]);
                    iniAction();
                }
            }
            function enhancedDetails() {
                function setVideoCount() {
                    var span = document.createElement("span");
                    span.textContent = " · ";
                    enhancedDetails.username.appendChild(span);
                    enhancedDetails.link.href = window.location.origin + "/channel/" + enhancedDetails.user.dataset.ytid + "/videos";
                    enhancedDetails.username.appendChild(enhancedDetails.link);
                }
                function updateVideoCount(details) {
                    details = details.target.response.querySelector(".pl-header-details li:nth-child(2)");
                    if (details) {
                        enhancedDetails.link.className = "spf-link";
                        enhancedDetails.link.textContent = cid[enhancedDetails.user.dataset.ytid] = details.textContent;
                        setVideoCount();
                    }
                }
                function getVideoCount() {
                    enhancedDetails.username = document.querySelector(".yt-user-info");
                    if (!document.getElementById("uploaded-videos") && enhancedDetails.username) {
                        enhancedDetails.link = document.createElement("a");
                        enhancedDetails.link.id = "uploaded-videos";
                        enhancedDetails.username.appendChild(enhancedDetails.link);
                        enhancedDetails.user = enhancedDetails.username.querySelector("a");
                        if (cid[enhancedDetails.user.dataset.ytid]) {
                            enhancedDetails.link.textContent = cid[enhancedDetails.user.dataset.ytid];
                            setVideoCount();
                        } else {
                            localXHR("GET", updateVideoCount, "/playlist?list=" + enhancedDetails.user.dataset.ytid.replace("UC", "UU"), "doc");
                        }
                    }
                }
                function getChannelInfo(details) {
                    var retry, isLive;
                    isLive = details.target.response.querySelector(".yt-badge-live");
                    if (!isLive) {
                        retry = details.target.responseURL.split("/videos").length < 2;
                        details = details.target.response.querySelectorAll("[data-context-item-id='" + window.ytplayer.config.args.video_id + "'] .yt-lockup-meta-info li");
                        if (details && details.length > 0 && enhancedDetails.watchTime.textContent.split("·").length < 2) {
                            enhancedDetails.watchTime.textContent += " · " + details[retry ? 0 : 1].textContent;
                        } else if (retry) {
                            localXHR("GET", getChannelInfo, "/channel/" + window.ytplayer.config.args.ucid + "/videos", "doc");
                        }
                    }
                }
                function getPublishedTime() {
                    enhancedDetails.watchTime = document.querySelector(".watch-time-text");
                    if (enhancedDetails.watchTime && !enhancedDetails.watchTime.fetching && window.ytplayer && window.ytplayer.config) {
                        enhancedDetails.watchTime.fetching = true;
                        localXHR("GET", getChannelInfo, "/channel/" + window.ytplayer.config.args.ucid + "/search?query=%22" + window.ytplayer.config.args.video_id + "%22", "doc");
                    }
                }
                if (window.location.pathname === "/watch") {
                    if (user_settings.VID_VID_CNT) {
                        getVideoCount();
                    }
                    if (user_settings.VID_POST_TIME) {
                        getPublishedTime();
                    }
                }
            }
            function playlistControls() {
                function reverseControl() {
                    var i, temp, prev, next, list, videos;
                    prev = document.querySelector(".prev-playlist-list-item");
                    next = document.querySelector(".next-playlist-list-item");
                    list = document.getElementById("playlist-autoscroll-list");
                    videos = list.getElementsByTagName("li");
                    i = videos.length;
                    while (i--) {
                        list.appendChild(videos[i]);
                    }
                    temp = prev.href;
                    prev.href = next.href;
                    next.href = temp;
                    list.scrollTop = document.querySelector(".currently-playing").offsetTop;
                    if (api) {
                        api.updatePlaylist();
                    }
                }
                function reverseButton(event) {
                    if (event.target.id === "reverse") {
                        event.target.classList.toggle("yt-uix-button-toggled");
                        set("plRev", (event.target.classList.contains("yt-uix-button-toggled")) ? window.yt.config_.LIST_ID : false);
                        reverseControl();
                    }
                }
                function autoplayButton(event) {
                    if (event.target.id === "autoplay") {
                        event.target.classList.toggle("yt-uix-button-toggled");
                        set("plApl", event.target.classList.contains("yt-uix-button-toggled"));
                    }
                }
                function createButton(type, label, bool, call) {
                    var button = document.createElement("template");
                    button.innerHTML = //
                        `<button class='yt-uix-button yt-uix-button-player-controls yt-uix-button-opacity yt-uix-tooltip' type='button'>
                            <span class='yt-uix-button-icon'></span>
                        </button>`;
                    if (bool === true || window.location.href.split(bool).length > 1) {
                        button.content.querySelector("button").classList.add("yt-uix-button-toggled");
                    }
                    button.content.firstChild.id = type;
                    button.content.firstChild.dataset.p = "ttp|" + label + "&ttl|" + label;
                    button.content.firstChild.classList.add("yt-uix-button-icon-watch-appbar-" + type + "-video-list", "ytplus_sprite");
                    button = setLocale(button.content).firstChild;
                    playlistControls.plBar.className = playlistControls.plBar.className.replace("radio-playlist", "");
                    eventHandler([document, "click", call]);
                    document.querySelector(".playlist-nav-controls").appendChild(button);
                }
                playlistControls.plBar = document.getElementById("watch-appbar-playlist");
                if (playlistControls.plBar) {
                    if (document.readyState === "complete" && user_settings.plRev && window.location.href.split(user_settings.plRev).length > 1) {
                        reverseControl();
                    }
                    if (user_settings.VID_PLST_RVRS && !document.getElementById("reverse")) {
                        createButton("reverse", "PLST_RVRS", user_settings.plRev, reverseButton);
                    }
                    if (user_settings.VID_PLST_ATPL && !document.getElementById("autoplay")) {
                        createButton("autoplay", "PLST_AP", user_settings.plApl, autoplayButton);
                    }
                }
            }
            function checkXHR(original) {
                function xhrPatch(event) {
                    var temp;
                    if (checkXHR.readyState === 4) {
                        temp = {args: JSON.parse(
                            "{\"" +
                            decodeURIComponent(checkXHR.responseText
                                .replace(/%5C/g, "%5C%5C")
                                .replace(/%22/g, "%5C%22")
                                .replace(/&/g, "\",\"")
                                .replace(/\=/g, "\":\"")
                                .replace(/\+/g, "%20")
                            ) +
                            "\"}"
                        )};
                        temp = modArgs(temp);
                        temp = encodeURIComponent(JSON.stringify(temp.args).split(/\{"([\w\W]*?)"\}/)[1])
                            .replace(/%5C%5C/g, "%5C")
                            .replace(/%5C%22/g, "%22")
                            .replace(/%22%2C%22/g, "&")
                            .replace(/%22%3A%22/g, "=")
                            .replace(/%20/g, "+");
                        Object.defineProperty(checkXHR, "responseText", {writable: true});
                        checkXHR.responseText = temp;
                    }
                }
                return function(method, url) {
                    if (url.match("get_video_info")) {
                        eventHandler([this, "readystatechange", xhrPatch]);
                    }
                    return original.apply(this, arguments);
                };
            }
            function volumeWheel(event) {
                var fsPl, pSets, ivCard, player, cBottom, canScroll, direction;
                player = document.querySelector("video");
                fsPl = document.querySelector(".ytp-playlist-menu");
                pSets = document.querySelector(".ytp-settings-menu");
                ivCard = document.querySelector(".iv-drawer");
                canScroll = event && (!fsPl || (fsPl && !fsPl.contains(event.target))) && (!ivCard || (ivCard && !ivCard.contains(event.target))) && (!pSets || (pSets && !pSets.contains(event.target)));
                if (event && api && player && canScroll && (event.target.id === api || api.contains(event.target))) {
                    event.preventDefault();
                    cBottom = document.querySelector(".ytp-chrome-bottom");
                    if (cBottom) {
                        if (!cBottom.classList.contains("ytp-volume-slider-active")) {
                            cBottom.classList.add("ytp-volume-slider-active");
                        }
                        if (cBottom.timer) {
                            window.clearTimeout(cBottom.timer);
                        }
                        if (api) {
                            api.dispatchEvent(new Event("mousemove"));
                        }
                        cBottom.timer = window.setTimeout(() => {
                            if (cBottom && cBottom.classList.contains("ytp-volume-slider-active")) {
                                cBottom.classList.remove("ytp-volume-slider-active");
                                delete cBottom.timer;
                            }
                        }, 4000);
                    }
                    direction = event && (event.deltaY || event.wheelDeltaY);
                    api.setVolume(player.volume * 100 - (Math.sign(direction) * 5));
                } else if (!event && user_settings.VID_VOL_WHEEL) {
                    eventHandler([document, "wheel", volumeWheel]);
                } else if (window.location.pathname !== "/watch") {
                    eventHandler([document, "wheel", volumeWheel, false, "remove"]);
                }
            }
            function dragPopOut(event) {
                var excluded, isFScreen;
                excluded = document.querySelector(".ytp-chrome-bottom");
                isFScreen = document.querySelector(".ytp-fullscreen");
                if (event && !isFScreen && (!excluded || (event.target !== excluded && !excluded.contains(event.target)))) {
                    if (event.buttons === 1) {
                        if (event.type === "mousedown") {
                            event.preventDefault();
                            event.stopPropagation();
                            eventHandler([document, "mousemove", dragPopOut, false]);
                            eventHandler([document, "click", dragPopOut, true]);
                            window.oldPos = {
                                X: event.clientX,
                                Y: event.clientY,
                                orgX: event.clientX,
                                orgY: event.clientY
                            };
                        } else if (event.type === "mousemove" && (window.hasMoved || Math.abs(event.clientX - window.oldPos.orgX) > 10 || Math.abs(event.clientY - window.oldPos.orgY) > 10)) {
                            window.moveBy(event.clientX - window.oldPos.X, event.clientY - window.oldPos.Y);
                            window.hasMoved = true;
                        }
                    }
                    if (event.buttons !== 1 || event.type === "click") {
                        if (window.hasMoved) {
                            event.preventDefault();
                            event.stopImmediatePropagation();
                            delete window.oldPos;
                            delete window.hasMoved;
                        }
                        eventHandler([document, "mousemove", dragPopOut, false, "remove"]);
                        eventHandler([document, "click", dragPopOut, true, "remove"]);
                    }
                } else if (!event && window.name === "popOut") {
                    eventHandler([document, "mousedown", dragPopOut]);
                }
            }
            function popPlayer(url) {
                var popOut, width, height, pop_url, video;
                width = parseInt(user_settings.VID_PPOT_SZ) || 533;
                height = Math.round(width / (16 / 9));
                video = document.querySelector("video");
                pop_url = (!url.target && url) || window.location.href.split(/&t=[0-9]+|#t=[0-9]+|&time=[0-9]+/).join("");
                if (url.target && video && video.currentTime && video.currentTime < video.duration) {
                    pop_url += "#t=" + video.currentTime;
                    window.ytplayer.config.args.start = video.currentTime;
                    api.cueVideoByPlayerVars(window.ytplayer.config.args);
                }
                popOut = window.open(pop_url, "popOut", "width=" + width + ",height=" + height);
                popOut.focus();
            }
            function subPlaylist() {
                var button, nav_menu, list_title, video_list;
                nav_menu = document.querySelector(".appbar-nav-menu");
                button = document.getElementById("subscription-playlist");
                list_title = document.querySelector(".appbar-nav-menu");
                video_list = document.getElementsByClassName("addto-watch-later-button");
                if (user_settings.GEN_SUB_LIST && nav_menu && window.location.href.split("/feed/subscriptions").length > 1 && !button && list_title && video_list) {
                    button = document.createElement("template");
                    button.innerHTML = //
                        `<li id='subscription-playlist-icon'>
                            <a id='subscription-playlist' data-p='ttl|SUB_PLST' class='yt-uix-button spf-link yt-uix-sessionlink yt-uix-button-epic-nav-item yt-uix-button-size-default'>
                                <span class='yt-uix-button-content ytplus_sprite'></span>
                            </a>
                        </li>`;
                    button = setLocale(button.content).firstChild;
                    nav_menu.appendChild(button);
                    eventHandler([document, "click", event => {
                        var i, list;
                        list = [];
                        if (event.target && event.target.parentNode && event.target.parentNode.id === "subscription-playlist") {
                            i = video_list.length;
                            while (i--) {
                                if (i > -1) {
                                    list.push(video_list[i].dataset.videoIds);
                                }
                            }
                            list.reverse().join("%2C");
                            list_title = list_title && list_title.querySelector(".epic-nav-item-heading").textContent.trim();
                            button = document.getElementById("subscription-playlist");
                            button.href = "/watch_videos?title=" + list_title + "&video_ids=" + list;
                        }
                    }]);
                }
            }
            function modComments() {
                var is_live, wrapper, comments;
                is_live = window.ytplayer && window.ytplayer.config && window.ytplayer.config.args && window.ytplayer.config.args.livestream;
                comments = document.getElementById("watch-discussion");
                if (!is_live && comments && !document.getElementById("P-show-comments") && user_settings.VID_HIDE_COMS === "1") {
                    wrapper = document.createElement("template");
                    wrapper.innerHTML = //
                        `<div id='P-show-comments' class='yt-card'>
                            <button class='yt-uix-button yt-uix-button-expander' data-p='tnd|SHOW_CMTS'></button>
                        </div>`;
                    wrapper = setLocale(wrapper.content).firstChild;
                    eventHandler([document, "click", event => {
                        if (event.target && event.target.parentNode && event.target.parentNode.id === "P-show-comments") {
                            if (comments.lazyload) {
                                window.spf.load.apply(main, comments.lazyload);
                            }
                            comments.classList.toggle("show");
                            wrapper.querySelector("button").textContent = lang((comments.classList.contains("show") && "HIDE_CMTS") || "SHOW_CMTS");
                        }
                    }]);
                    comments.parentNode.insertBefore(wrapper, comments);
                }
            }
            function customStyles() {
                var plr_api, comments, sidebar, ytGrid, adverts, custom_styles;
                comments = document.getElementById("watch-discussion");
                ytGrid = document.querySelector(".yt-uix-menu-top-level-flow-button:last-child a");
                custom_styles = {
                    GEN_DSBL_ADS    : "part_no_ads",
                    GEN_BLUE_GLOW   : "part_dsbl_glow",
                    GEN_HIDE_FTR    : "part_hide_footer",
                    GEN_BTTR_NTF    : "part_notif_button",
                    GEN_GRID_SUBS   : "part_grid_subs",
                    GEN_GRID_SRCH   : "part_grid_search",
                    GEN_CMPT_TTLS   : "part_compact_titles",
                    VID_PLR_ATPL    : "part_autoplayon",
                    VID_PLR_FIT     : "part_fit_theater",
                    VID_PLR_DYN_SIZE: "part_static_size",
                    VID_HIDE_DETLS  : "part_hide_details",
                    VID_TTL_CMPT    : "part_compact_title",
                    VID_DESC_SHRT   : "part_labelless_buttons"
                };
                if (window.name === "popOut") {
                    document.documentElement.classList.add("part_popout");
                }
                if (ytGrid && user_settings.GEN_GRID_SUBS) {
                    ytGrid.click();
                } else {
                    plr_api = document.getElementById("player-api");
                    sidebar = document.querySelector(".branded-page-v2-secondary-col");
                    adverts = user_settings.GEN_DSBL_ADS && document.querySelector(`
                        #masthead_child,
                        #feed-pyv-container,
                        .ad-div,
                        .pyv-afc-ads-container,
                        .video-list-item:not(.related-list-item):not(.dashboard-widget-item)
                    `);
                    while (adverts) {
                        adverts.remove();
                        adverts = document.querySelector(`
                            #masthead_child,
                            #feed-pyv-container,
                            .ad-div,
                            .pyv-afc-ads-container,
                            .video-list-item:not(.related-list-item):not(.dashboard-widget-item)
                        `);
                    }
                    if ((window.location.pathname === "/results" && sidebar && sidebar.querySelectorAll("*").length < 10) || (sidebar && ((user_settings.GEN_HDE_RECM_SDBR && window.location.href.split("/feed/subscriptions").length > 1) || (user_settings.GEN_HDE_SRCH_SDBR && window.location.pathname === "/results") || (user_settings.GEN_HDE_CHN_SDBR && window.location.href.split(/\/(channel|user|c)\//).length > 1)))) {
                        sidebar.remove();
                    }
                    if (window.location.pathname === "/watch" && user_settings.VID_HIDE_COMS > 1 && comments) {
                        comments.remove();
                    }
                    if (user_settings.VID_HIDE_COMS === "1") {
                        document.documentElement.classList.add("part_hide_comments");
                    } else if (user_settings.VID_HIDE_COMS !== "1") {
                        document.documentElement.classList.remove("part_hide_comments");
                    }
                    if (user_settings.VID_PLR_FIT && plr_api && (!!plr_api.style.maxWidth || plr_api.style.maxWidth !== user_settings.VID_PLR_FIT_WDTH)) {
                        plr_api.style.maxWidth = user_settings.VID_PLR_FIT_WDTH || "1280px";
                    }
                    Object.keys(custom_styles).forEach(clss => document.documentElement.classList[user_settings[clss] ? "add" : "remove"](custom_styles[clss]));
                    if (window.location.href.split("/feed/subscriptions").length < 2) {
                        document.documentElement.classList.remove("part_grid_subs");
                    }
                }
            }
            function defaultChannelPage(event) {
                var parentNode;
                if (user_settings.GEN_CHN_DFLT_PAGE !== "default") {
                    if (event && event.target) {
                        parentNode = event.target;
                        if (event.target.tagName !== "A") {
                            while (parentNode) {
                                parentNode = parentNode.parentNode;
                                if (parentNode && parentNode.tagName === "A") {
                                    break;
                                }
                            }
                        }
                        if (parentNode && parentNode.href && parentNode.href.split(user_settings.GEN_CHN_DFLT_PAGE).length < 2 && (parentNode.href.split("/channel/").length > 1 || parentNode.href.split("/user/").length > 1) && parentNode.href.split(/[a-z0-9]\/[a-z0-9]/i).length < 4) {
                            parentNode.href += "/" + user_settings.GEN_CHN_DFLT_PAGE;
                        }
                    } else if (!event) {
                        eventHandler([document, "mouseup", defaultChannelPage]);
                    }
                }
            }
            function modArgs(config) {
                var i, temp, list, length, videos, new_list, can_share;
                if (config.args.video_id) {
                    if (window.name === "popOut") {
                        can_share = document.querySelector(".playlist-header-content");
                        if (can_share && can_share.dataset.shareable === "False" && !config.args.video) {
                            config.args.video = [];
                            videos = document.querySelectorAll("li[data-video-id]");
                            length = videos.length;
                            for (i = 0; i < length; i++) {
                                config.args.video[i] = {"encrypted_id": videos[i].getAttribute("data-video-id")};
                            }
                        }
                        document.title = config.args.title;
                        config.args.el = "embedded";
                    }
                    config.args.dash = (user_settings.VID_PLR_DASH && "0") || config.args.dash;
                    config.args.vq = user_settings.VID_DFLT_QLTY;
                    if (user_settings.VID_DFLT_QLTY !== "auto") {
                        try {
                            window.localStorage["yt-player-quality"] = JSON.stringify({
                                "data": user_settings.VID_DFLT_QLTY,
                                "expiration": new Date().getTime() + 864E5,
                                "creation": new Date().getTime()
                            });
                        } catch (ignore) {}
                    }
                    if (config.args.caption_audio_tracks && user_settings.VID_PLR_CC) {
                        config.args.caption_audio_tracks = config.args.caption_audio_tracks.split(/&d=[0-9]|d=[0-9]&/).join("");
                    }
                    if (user_settings.VID_PLR_VOL_LDN) {
                        delete config.args.loudness;
                    }
                    if (user_settings.VID_PLR_HTML5) {
                        config.html5 = true;
                    }
                    if (user_settings.VID_PLR_INFO) {
                        config.args.showinfo = "1";
                    }
                    if (!user_settings.VID_PLR_ATPL) {
                        config.args.autoplay = "0";
                    }
                    if (user_settings.VID_PLR_SIZE_MEM) {
                        config.args.player_wide = (user_settings.theaterMode && "1") || "0";
                        if (window.ytpsetwide) {
                            window.ytpsetwide("wide", config.args.player_wide, -1);
                        }
                    }
                    if ((config.args.iv_load_policy || config.args.iv_endscreen_url) && user_settings.VID_PLR_ANTS) {
                        config.args.iv_load_policy = "3";
                        delete config.args.iv_endscreen_url;
                    }
                    if (user_settings.VID_PLR_ADS && (!user_settings.VID_SUB_ADS || (user_settings.VID_SUB_ADS && !config.args.subscribed))) {
                        delete config.args.ad3_module;
                    }
                    if (config.args.vmap && !user_settings.VID_PLR_ATPL && !user_settings.VID_PLR_ADS) {
                        config.args.dvmap = config.args.vmap;
                        delete config.args.vmap;
                    }
                    if (config.args.adaptive_fmts && user_settings.VID_PLR_HFR) {
                        new_list = [];
                        list = config.args.adaptive_fmts.split(",");
                        i = list.length;
                        while (i--) {
                            temp = list[i].split(/fps\=([0-9]{2})/)[1];
                            if (!temp || temp < 31) {
                                new_list.push(list[i]);
                            }
                        }
                        config.args.adaptive_fmts = new_list.join(",");
                    }
                    if (window.ytplayer) {
                        if (window.ytplayer.config === null) {
                            window.ytplayer.config = config;
                        } else if (window.ytplayer.config) {
                            window.ytplayer.config.args = config.args;
                        }
                    }
                }
                return config;
            }
            function generalChanges() {
                var logo, checkbox, autoplaybar, description;
                autoplaybar = document.querySelector(".autoplay-bar");
                description = document.getElementById("action-panel-details");
                if (user_settings.GEN_YT_LOGO_LINK && window.yt && window.yt.config_ && window.yt.config_.LOGGED_IN) {
                    logo = document.querySelector("map[name='doodle'] > area, #logo-container");
                    if (logo && logo.href === window.location.origin + "/") {
                        logo.href = "/feed/subscriptions";
                    }
                }
                if (user_settings.GEN_REM_APUN && window.location.pathname === "/watch" && autoplaybar) {
                    autoplaybar.removeAttribute("class");
                    checkbox = document.querySelector(".checkbox-on-off");
                    if (checkbox) {
                        checkbox.remove();
                    }
                }
                if (user_settings.VID_LAYT_AUTO_PNL && window.location.pathname === "/watch" && description) {
                    description.classList.remove("yt-uix-expander-collapsed");
                }
                if (user_settings.GEN_SPF_OFF && window.spf && window.spf.dispose) {
                    window.spf.dispose();
                }
            }
            function localXHR(method, call, url, head) {
                var request = new XMLHttpRequest();
                request.addEventListener("load", call);
                request.open(method, url, true);
                if (head && head !== "doc") {
                    request.setRequestHeader(head[0], head[1]);
                } else {
                    request.responseType = "document";
                }
                request.send();
            }
            function playerMode() {
                var pageElement, playerElement;
                if (user_settings.VID_PLR_SIZE_MEM) {
                    pageElement = document.getElementById("page");
                    playerElement = document.getElementById("player");
                    if (window.ytpsetwide) {
                        window.ytpsetwide("wide", (user_settings.theaterMode ? "1" : "0"), -1);
                    }
                    if (playerElement && window.location.pathname === "/watch") {
                        pageElement.classList[user_settings.theaterMode ? "add" : "remove"]("watch-wide");
                        pageElement.className = pageElement.className.replace(user_settings.theaterMode ? "non-" : "watch-stage", user_settings.theaterMode ? "" : "watch-non-stage");
                        playerElement.className = user_settings.theaterMode ? playerElement.className.replace("small", "large") : playerElement.className.replace("large", "small").replace("medium", "small");
                    }
                }
            }
            function infiniteScroll() {
                var observer, loadMore;
                loadMore = document.querySelector(".load-more-button");
                if (loadMore && user_settings.GEN_INF_SCRL) {
                    if (!loadMore.classList.contains("infiniteScroll")) {
                        loadMore.classList.add("infiniteScroll");
                        observer = new MutationObserver(infiniteScroll);
                        observer.observe(loadMore, {attributes: true});
                    }
                    if (!loadMore.classList.contains("scrolldetect")) {
                        loadMore.classList.add("scrolldetect");
                        loadMore.dataset.scrolldetectCallback = "load-more-auto";
                    }
                }
            }
            function checkNewFeatures() {
                var i, keys;
                keys = Object.keys(default_settings);
                i = keys.length;
                while (i) {
                    i -= 1;
                    if (!user_settings.hasOwnProperty(keys[i])) {
                        set(keys[i], default_settings[keys[i]]);
                    }
                }
            }
            function shareApi(original) {
                return function () {
                    playerReady();
                    if (original) {
                        return original.apply(this, arguments);
                    }
                };
            }
            function request(event) {
                var video_player = document.getElementById("movie_player");
                document.documentElement.classList.remove("floater");
                if (video_player) {
                    video_player.removeAttribute("style");
                    if (!user_settings.VID_PLR_ATPL || event.detail.url.split("/watch").length < 2) {
                        if (window.ytplayer && window.ytplayer.config && window.ytplayer.config.loaded) {
                            delete window.ytplayer.config.loaded;
                        }
                        api.destroy();
                    }
                }
            }
            function pageScriptMessages() {
                var key, gate, sets, observer;
                key = "parreceive";
                gate = document.documentElement;
                sets = JSON.parse(gate.dataset[key] || null);
                if (!gate.pagescript) {
                    gate.pagescript = true;
                    observer = new MutationObserver(pageScriptMessages);
                    return observer.observe(gate, {
                        attributes:true,
                        attributeFilter: ["data-" + key]
                    });
                }
                if (sets) {
                    user_settings = sets;
                    gate.dataset[key] = null;
                    customStyles();
                    document.documentElement.dataset.parreceive = "";
                }
            }
            function set(setting, new_value) {
                if (setting !== "user_settings") {
                    user_settings[setting] = new_value;
                } else {
                    user_settings = new_value;
                }
                document.documentElement.dataset.parsend = JSON.stringify(user_settings);
            }
            function main() {
                pageScriptMessages();
                customStyles();
                settingsMenu();
                infiniteScroll();
                playlistControls();
                playerMode();
                advancedOptions();
                volumeWheel();
                subPlaylist();
                alwaysVisible();
                modThumbs();
                enhancedDetails();
                modComments();
                defaultChannelPage();
                generalChanges();
                dragPopOut();
            }
            function isMaterial() {
                var i, temp;
                temp = document.querySelectorAll("link");
                i = temp.length;
                while (i--) {
                    if (temp[i].href.match("olymer")) {
                        temp = document.createElement("template");
                        temp.innerHTML = //
                            `<div style='border-radius:2px;color:#FFF;padding:10px;background-color:#09F;box-shadow:0 0 3px rgba(0,0,0,.5);font-size:12px;position:fixed;bottom:20px;right:20px;z-index:99999'>
                            YouTube Plus is not yet compatible with the YouTube beta Material Layout<br>
                            <a href='https://github.com/ParticleCore/Particle/wiki/Restore-classic-YouTube' target='_blank' style='color:#FFF;font-weight:bold;'>Click here</a> for instructions to restore classic YouTube and continue using YT+<br>
                            To keep using the current layout without this message please disable YT+
                            </div>`;
                        document.documentElement.appendChild(temp.content.firstChild);
                        return true;
                    }
                }
            }
            var api, cid, events, language, user_settings, player_instance, default_settings;
            if (isMaterial()) {
                return;
            }
            cid = {};
            events = {};
            user_settings = JSON.parse(document.documentElement.dataset.user_settings || null);
            default_settings = {
                GEN_BTTR_NTF    : true,
                GEN_SUB_LIST    : true,
                GEN_INF_SCRL    : true,
                GEN_BLUE_GLOW   : true,
                GEN_PPOT_ON     : true,
                VID_END_SHRE    : true,
                VID_DFLT_QLTY   : "auto",
                VID_PLST_ATPL   : true,
                VID_PLST_RVRS   : true,
                VID_PLR_ATPL    : true,
                VID_PLR_ALVIS   : true,
                VID_PLR_SIZE_MEM: true,
                VID_PLR_FIT     : true,
                VID_PLR_VOL_LDN : true,
                VID_POST_TIME   : true,
                VID_VID_CNT     : true,
                VID_DESC_SHRT   : true,
                VID_PPOT_SZ     : 533,
                VID_PLR_HTML5   : true,
                BLK_ON          : true,
                floaterX        : 2000,
                floaterY        : 2000,
                firstTime       : true,
                volLev          : 50,
                advOpts         : true,
                blacklist       : {}
            };
            language = {
                YTSETS                : "YouTube+ settings",
                ADV_OPTS              : "Advanced options",
                SUB_PLST              : "Play recent uploads",
                PPOT_OPEN             : "Open in pop-out",
                BLCK_ADD              : "Add to blacklist",
                BLCK_EDIT             : "Edit",
                BLCK_SAVE             : "Save",
                BLCK_CLSE             : "Close",
                CNSL_AP               : "Autoplay",
                CNSL_RPT              : "Repeat video",
                CNSL_SVTH             : "Open thumbnail",
                CNSL_SS               : "Take screenshot",
                CNSL_SS_CLS           : "CLOSE",
                CNSL_PPOT             : "Pop-out video",
                CNSL_FLBR             : "Fullbrowser mode",
                CNSL_CINM_MD          : "Cinema mode",
                CNSL_FRME             : "Frame by frame (Shift + ← or →)",
                PLST_AP               : "Autoplay",
                PLST_RVRS             : "Reverse",
                SHOW_CMTS             : "Show comments",
                HIDE_CMTS             : "Hide comments",
                GLB_IMPR              : "Import/export settings",
                GLB_LOCL_LANG         : "Click to edit YT+ language",
                GLB_LOCL_LANG_CSTM    : "Local",
                GLB_IMPR_SAVE         : "Save and load",
                GLB_RSET              : "Reset",
                GLB_SVE               : "Save",
                GLB_SVE_SETS          : "Settings saved",
                FTR_DESC              : "Find out what this does",
                GEN                   : "General",
                VID                   : "Video",
                CHN                   : "Channels",
                BLK                   : "Blacklist",
                ABT                   : "About",
                HLP                   : "Help",
                DNT                   : "Donate",
                GEN_TTL               : "General settings",
                GEN_GEN               : "General",
                GEN_LYT               : "Layout",
                GEN_LOCL_LANG         : "Use modified YT+ language",
                GEN_PPOT_ON           : "Enable pop-out mode",
                GEN_DSBL_ADS          : "Disable advertisements outside the video page",
                GEN_INF_SCRL          : "Enable infinite scroll in feeds",
                GEN_YT_LOGO_LINK      : "YouTube logo redirects to subscriptions",
                GEN_SUB_LIST          : "Enable subscription playlist",
                GEN_REM_APUN          : "Remove autoplay up next",
                GEN_SPF_OFF           : "Disable SPF",
                GEN_HIDE_FTR          : "Hide footer",
                GEN_BLUE_GLOW         : "Remove blue glow around clicked buttons",
                GEN_HDE_RECM_SDBR     : "Hide recommended channels sidebar",
                GEN_HDE_SRCH_SDBR     : "Hide search results sidebar",
                GEN_HDE_CHN_SDBR      : "Hide channel sidebar",
                GEN_CMPT_TTLS         : "Compact titles in feeds",
                GEN_DSB_HVRC          : "Disable hovercards",
                GEN_BTTR_NTF          : "Improved blue notification box",
                GEN_GRID_SUBS         : "Grid layout in subscriptions",
                GEN_GRID_SRCH         : "Grid layout in search results",
                VID_TTL               : "Video settings",
                VID_PLR               : "Player settings",
                VID_PLR_LYT           : "Player layout",
                VID_DFLT_QLTY         : "Default video quality:",
                VID_DFLT_QLTY_AUTO    : "Auto",
                VID_DFLT_QLTY_TNY     : "144p",
                VID_DFLT_QLTY_SML     : "240p",
                VID_DFLT_QLTY_MDM     : "360p",
                VID_DFLT_QLTY_LRG     : "480p",
                VID_DFLT_QLTY_720     : "720p",
                VID_DFLT_QLTY_1080    : "1080p",
                VID_DFLT_QLTY_1440    : "1440p",
                VID_DFLT_QLTY_2160    : "2160p (4k)",
                VID_DFLT_QLTY_2880    : "2880p (5k)",
                VID_DFLT_QLTY_ORIG    : "4320p (8k)",
                VID_PLR_ALVIS         : "Player always visible when reading comments",
                VID_PLR_ALVIS_WDTH    : "Floating player width",
                VID_PLR_ALVIS_SCRL_TOP: "Go to top",
                VID_PLR_ATPL          : "Autoplay videos",
                VID_LAYT              : "Layout",
                VID_VID_CNT           : "Show link with number of uploaded videos",
                VID_POST_TIME         : "Show how long the video has been published",
                VID_HIDE_DETLS        : "Hide video details",
                VID_HIDE_COMS         : "Comment section",
                VID_HIDE_COMS_SHOW    : "Show",
                VID_HIDE_COMS_HIDE    : "Hide",
                VID_HIDE_COMS_REM     : "Remove",
                VID_END_SHRE          : "Disable share panel when video ends",
                VID_PLST              : "Playlists",
                VID_PLST_ATPL         : "Enable playlist autoplay control",
                VID_PLST_RVRS         : "Enable reverse playlist control",
                VID_PLR_SIZE_MEM      : "Memorize player mode",
                VID_VOL_WHEEL         : "Change volume with mouse wheel",
                VID_PLR_VOL_MEM       : "Memorize audio volume",
                VID_PLR_VOL_LDN       : "Disable YouTube loudness normalisation",
                VID_PLR_ADS           : "Disable advertisements in the video page",
                VID_PLR_ALACT         : "Player shortcuts always active",
                VID_SUB_ADS           : "Enable advertisements only in videos from subscribed channels",
                VID_PLR_ANTS          : "Disable annotations",
                VID_PLR_DASH          : "Disable DASH playback",
                VID_PLR_HFR           : "Disable HFR (60fps)",
                VID_PLR_HTML5         : "Use the HTML5 player when possible",
                VID_PLR_CC            : "Disable subtitles and CC",
                VID_PLR_INFO          : "Enable info bar with watch later button",
                VID_PLR_FIT           : "Fit to page in theater mode",
                VID_PLR_FIT_WDTH      : "Fit to page max width:",
                VID_PLR_DYN_SIZE      : "Disable dynamic player size in default view",
                VID_DESC_SHRT         : "Short video description buttons",
                VID_TTL_CMPT          : "Compact title in video description",
                VID_PPOT_SZ           : "Pop-out player size",
                VID_LAYT_AUTO_PNL     : "Auto expand video description",
                GEN_CHN_DFLT_PAGE     : "Default channel page:",
                GEN_CHN_DFLT_PAGE_DFLT: "Default",
                GEN_CHN_DFLT_PAGE_VID : "Videos",
                GEN_CHN_DFLT_PAGE_PL  : "Playlists",
                GEN_CHN_DFLT_PAGE_CHN : "Channels",
                GEN_CHN_DFLT_PAGE_DISC: "Discussion",
                GEN_CHN_DFLT_PAGE_ABT : "About",
                BLK_TTL               : "Blacklist settings",
                BLK_BLK               : "Blacklist",
                BLK_ON                : "Enable blacklist",
                ABT_TTL               : "Information and useful links",
                ABT_THKS              : "Thanks to:",
                ABT_THKS_YEPPHA       : ", who's work inspired the creation of this project, without whom none of this would exist today.",
                ABT_THKS_USERSCRIPT   : " for making the task of developing and shipping third party software incredibly easier.",
                ABT_THKS_STACKOV      : " for all of its priceless information which greatly contributes for software development.",
                ABT_INFO              : "Official pages",
                ABT_LNK_GHB           : "GitHub",
                ABT_LNK_GRFK          : "Greasy Fork",
                ABT_LNK_OPNU          : "OpenUserJS",
                WLCM                  : "Thank you for installing YouTube+",
                WLCMSTRT              : "You can customize your settings by clicking the button above",
                WLCMFTRS              : "Click here to see all the features",
                LOCALE                : "English (US)"
            };
            if (!user_settings || Object.keys(user_settings).length < 1) {
                user_settings = default_settings;
            } else {
                checkNewFeatures();
            }
            if (window.chrome) {
                eventHandler([document.documentElement, "load", scriptExit, true]);
            } else {
                eventHandler([document, "afterscriptexecute", scriptExit]);
            }
            eventHandler([document, "spfdone", main]);
            eventHandler([document, "spfrequest", request]);
            eventHandler([document, "readystatechange", main, true]);
            XMLHttpRequest.prototype.open = checkXHR(XMLHttpRequest.prototype.open);
            window.onYouTubePlayerReady = shareApi(window.onYouTubePlayerReady);
            window.matchMedia = false;
            main();
        },
        contentScriptMessages: function() {
            var key1, key2, gate, sets, locs, observer;
            key1 = "parsend";
            key2 = "getlocale";
            gate = document.documentElement;
            sets = JSON.parse(gate.dataset[key1] || null);
            locs = gate.dataset[key2] || null;
            if (!gate.contentscript) {
                gate.contentscript = true;
                observer = new MutationObserver(particle.contentScriptMessages);
                return observer.observe(gate, {
                    attributes: true,
                    attributeFilter: ["data-" + key1, "data-" + key2]
                });
            }
            if (sets) {
                if (particle.is_userscript) {
                    particle.GM_setValue(particle.id, JSON.stringify(sets));
                } else {
                    chrome.storage.local.set({particleSettings: sets});
                }
                document.documentElement.dataset.parsend = "";
            } else if (locs) {
                document.documentElement.dataset.setlocale = chrome.i18n.getMessage(locs);
            }
        },
        main: function(event) {
            var holder;
            if (!event && particle.is_userscript) {
                event = JSON.parse(particle.GM_getValue(particle.id, "{}"));
            }
            if (event) {
                event = JSON.stringify(event[particle.id] || event);
                document.documentElement.dataset.user_settings = event;
                if (particle.is_userscript) {
                    holder = document.createElement("link");
                    holder.rel = "stylesheet";
                    holder.type = "text/css";
                    holder.href = "https://particlecore.github.io/Particle/stylesheets/YouTubePlus.css";
                    document.documentElement.appendChild(holder);
                } else if (window.chrome) {
                    holder = document.createElement("style");
                    holder.textContent = //
                        `.ytplus_sprite,
                        #DNT:hover:after,
                        #player-console > div,
                        #P-content input[type='radio']:checked + label:before,
                        #P-content input[type='checkbox']:checked + label:before{
                            background-image: url(chrome-extension://` + window.chrome.runtime.id + `/images/sprite.png);
                        }`;
                    document.documentElement.appendChild(holder);
                }
                holder = document.createElement("script");
                holder.textContent = "(" + particle.inject + "(" + particle.is_userscript + "))";
                document.documentElement.appendChild(holder);
                if (!particle.is_userscript) {
                    chrome.storage.onChanged.addListener(keys => {
                        if (keys[particle.id] && keys[particle.id].new_value) {
                            document.documentElement.dataset.parreceive = JSON.stringify(
                                (keys[particle.id].new_value && keys[particle.id].new_value[particle.id]) || keys[particle.id].new_value || {}
                            );
                        }
                    });
                }
            }
        },
        ini: function() {
            particle.id = "particleSettings";
            particle.is_userscript = typeof GM_info === "object" ? true : false;
            if (particle.is_userscript) {
                particle.GM_getValue = GM_getValue;
                particle.GM_setValue = GM_setValue;
                particle.main();
            } else {
                chrome.storage.local.get(particle.id, particle.main);
            }
            particle.contentScriptMessages();
        }
    };
    particle.ini();
}());