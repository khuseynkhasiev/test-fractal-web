import { ChangeEvent, FormEvent, useCallback, useState, memo } from "react";

import "./App.css";

const BASE_URL = "https://api.github.com";

const enum TYPE {
    USER = "user",
    REPO = "repo",
}

const enum BASE_URL_TYPE {
    USERS = `${BASE_URL}/users`,
    REPOS = `${BASE_URL}/repos`,
}

interface IData {
    name: string;
    type: TYPE;
}

interface IUser {
    login: string;
    public_repos: number;
}

interface IRepo {
    name: string;
    stargazers_count: number;
}

const postData = (url: string, name: string): Promise<IUser | IRepo> => {
    return fetch(`${url}/${name}`).then((res) =>
        res.ok ? res.json() : Promise.reject(res)
    );
};

const InputForm = memo(
    ({
        name,
        handleChange,
    }: {
        name: string;
        handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
    }) => {
        return (
            <input
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
            />
        );
    }
);

const SelectForm = memo(
    ({
        type,
        handleChange,
    }: {
        type: TYPE;
        handleChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    }) => {
        return (
            <select name="type" value={type} onChange={handleChange}>
                <option value="user">user</option>
                <option value="repo">repo</option>
            </select>
        );
    }
);

const Button = memo(() => {
    return <button>Отправить</button>;
});

const UserDataRender = memo(({ userData }: { userData: IUser }) => {
    return (
        <>
            <p>User</p>
            <ul>
                <li>Имя: {userData.login}</li>
                <li>Число репозиториев: {userData.public_repos}</li>
            </ul>
        </>
    );
});

const RepoDataRender = memo(({ repoData }: { repoData: IRepo }) => {
    return (
        <>
            <p>Repo</p>
            <ul>
                <li>Название: {repoData.name}</li>
                <li>Число звезд: {repoData.stargazers_count}</li>
            </ul>
        </>
    );
});

const Form = ({
    setUserData,
    setRepoData,
    setLoading,
    setError,
}: {
    setUserData: React.Dispatch<React.SetStateAction<IUser | null>>;
    setRepoData: React.Dispatch<React.SetStateAction<IRepo | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const [data, setData] = useState<IData>({ name: "", type: TYPE.USER });
    const [inputError, setInputError] = useState<string | null>(null);

    // const handleChange = useCallback(
    //     (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //         setData((prev) => ({
    //             ...prev,
    //             [event.target.name]: event.target.value,
    //         }));
    //     },
    //     []
    // );

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = event.target;
            if (name === "name") {
                if (/^[a-zA-Z0-9]*$/.test(value)) {
                    setInputError(null);
                    setData((prev) => ({
                        ...prev,
                        [name]: value,
                    }));
                } else {
                    setInputError(
                        "Пожалуйста, используйте только латинские буквы и цифры"
                    );
                }
            } else {
                setData((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
        },
        []
    );

    const submitForm = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const { name, type } = data;
            setLoading(true);
            setError(null);
            if (type === TYPE.USER) {
                postData(BASE_URL_TYPE.USERS, name)
                    .then((data) => setUserData(data as IUser))
                    .catch((error) => {
                        setError("Error fetching user data");
                        console.error("Error fetching user data:", error);
                    })
                    .finally(() => setLoading(false));
            } else if (type === TYPE.REPO) {
                postData(BASE_URL_TYPE.REPOS, name)
                    .then((data) => setRepoData(data as IRepo))
                    .catch((error) => {
                        setError("Error fetching repo data");
                        console.error("Error fetching repo data:", error);
                    })
                    .finally(() => setLoading(false));
            }
            setData((prev) => ({ ...prev, name: "" }));
        },
        [data, setLoading, setError, setUserData, setRepoData]
    );

    return (
        <>
            <form action="" onSubmit={submitForm}>
                {inputError && <p>{inputError}</p>}

                <InputForm name={data.name} handleChange={handleChange} />
                <SelectForm type={data.type} handleChange={handleChange} />
                <Button />
            </form>
        </>
    );
};

function App() {
    const [userData, setUserData] = useState<IUser | null>(null);
    const [repoData, setRepoData] = useState<IRepo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <>
            <Form
                setUserData={setUserData}
                setRepoData={setRepoData}
                setLoading={setLoading}
                setError={setError}
            />
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {userData && <UserDataRender userData={userData} />}
            {repoData && <RepoDataRender repoData={repoData} />}
        </>
    );
}

export default App;
