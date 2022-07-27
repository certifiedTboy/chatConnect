import React, { useState, useEffect, Fragment } from "react";
import { searchUsers } from "../../lib/userApi";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { onLogout } from "../Auth/loginSlice";
import { registerationFail } from "../Auth/userRegisterationSlice";
import { acceptRequest, cancelRequest } from "../../lib/requestApi";
import { getUserProfile } from "../../lib/userApi";
import styles from "./MainNavigation.module.css";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import { showFriendsRequestPage } from "../Profile/profileActions";

const navigation = [
  { name: "Home", href: "/", current: true },
  { name: "Rooms", href: "/rooms", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MainNavigation = () => {
  const { user } = useSelector((state) => state.login);
  const [searchdata, setSearchData] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchUsersFailed, setSearchUsersFailed] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");
  const dispatch = useDispatch();

  // logout function
  const logOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessJWT");
    dispatch(onLogout());
    dispatch(registerationFail());
  };

  // search users function
  const changeSearchDataHandler = (event) => {
    setSearchData(
      event.target.value
        .toLowerCase()
        .replace(/(^|\s)\S/g, (L) => L.toUpperCase())
    );
    setSearchUsersFailed("");
  };

  // search side effect handler
  useEffect(() => {
    const identifier = setTimeout(() => {
      onSearchUsers();
    }, 1000);
    return () => {
      clearTimeout(identifier);
    };
  }, [searchdata, searchUsers]);

  const getUserFriendsRequest = async () => {
    const profile = await getUserProfile(user);
    setProfilePicture(profile.profile.profilePicture);
    setFriendRequests(profile.request || []);
  };

  useEffect(() => {
    getUserFriendsRequest(user);
  }, []);

  const onAcceptRequest = (event) => {
    acceptRequest(event.target.value);
  };

  const onRejectRequest = (event) => {
    cancelRequest(event.target.value);
  };

  const onSearchUsers = async () => {
    try {
      const response = await searchUsers(searchdata);
      if (!response || response.length === 0 || response.error) {
        setSearchUsersFailed(response.error);
      } else {
        setSearchedUsers(response);
      }
    } catch (error) {
      // setSearchUsersFailed(error);
      console.log(error.error);
    }
  };

  const showAllRequest = () => {
    dispatch(showFriendsRequestPage());
  };

  let searchResult = <div></div>;

  if (!searchdata || searchdata.trim().length === 0) {
    searchResult = <div></div>;
  }

  // render if no search result
  if (searchedUsers && searchedUsers.length > 0) {
    searchResult = searchedUsers.map((user) => (
      <a href={`/user/userprofile/${user.username}`}>
        {user.profile ? (
          <img
            className={styles.searchImg}
            src={`http://localhost:3001/${user.profile.profilePicture}`}
          />
        ) : (
          <img src="" />
        )}

        <span className={styles.searchName}>{user.username}</span>
      </a>
    ));
  }

  // render incase of server side error
  if (searchUsersFailed) {
    searchResult = <p className={styles.searchName}>{searchUsersFailed}</p>;
  }

  return (
    <Fragment>
      <Disclosure as="nav" className="bg-gray-800 fixed-top">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  Mobile menu button
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 flex items-center">
                    <NavLink to={"/"} className="text-brand">
                      {" "}
                      Chat <span className="color-b">Connect</span>
                    </NavLink>
                  </div>
                  {user && (
                    <div className="hidden sm:block sm:ml-6">
                      <div className="flex space-x-4">
                        {navigation.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* search bar */}

                {user && (
                  <div>
                    <div>
                      <div class="relative">
                        <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"></div>
                        <input
                          style={{ height: "30px", width: "300px" }}
                          type="search"
                          class="me-2 block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="Search all users..."
                          onChange={changeSearchDataHandler}
                        />
                        <div class={styles.dropdown}>
                          <div id="myDropdown" class={styles.dropdownContent}>
                            {searchResult}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {user && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                          <button
                            type="button"
                            className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                          >
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </Menu.Button>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              {({ active }) => (
                                <p className="bg-gray-100 block px-4 py-2 text-sm text-gray-700">
                                  {" "}
                                  Notifications{" "}
                                </p>
                              )}
                            </Menu.Item>

                            <Menu.Item>
                              {({ active }) => (
                                <p className="bg-gray-100 block px-4 py-2 text-sm text-gray-700">
                                  {" "}
                                  Friends Request{" "}
                                  <div>
                                    {friendRequests.map((request) => {
                                      return (
                                        <div>
                                          <p>{request.username}</p>
                                          <button
                                            key={request._id}
                                            value={request.username}
                                            className="btn btn-success"
                                            onClick={onAcceptRequest}
                                          >
                                            Accept
                                          </button>

                                          <button
                                            className="btn btn-danger"
                                            value={request.username}
                                            onClick={onRejectRequest}
                                          >
                                            Decline
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </p>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </div>
                    </Menu>

                    {/* Profile dropdown */}
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={`http://localhost:3001/${profilePicture}`}
                            alt=""
                          />
                        </Menu.Button>
                      </div>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <NavLink
                                to={`/user/userprofile/${user}`}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                Profile
                              </NavLink>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <a
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                                onClick={logOut}
                              >
                                Sign out
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                )}
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block px-3 py-2 rounded-md text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <div style={{ marginBottom: 100 }}></div>
    </Fragment>
  );
};

export default MainNavigation;
