import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID || "",
  ClientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
});

export function signUp(
  username: string,
  password: string,
  attributes: {
    name: string;
    email: string;
    preferred_username: string;
  }
) {
  const dataEmail = {
    Name: "email",
    Value: attributes.email,
  };
  const datausername = {
    Name: "name",
    Value: attributes.name,
  };
  const preferred_username = {
    Name: "preferred_username",
    Value: attributes.preferred_username,
  };

  const attributeEmail = new CognitoUserAttribute(dataEmail);
  const attributeName = new CognitoUserAttribute(datausername);
  const attributepreferred_username = new CognitoUserAttribute(
    preferred_username
  );

  const attributeList = [
    attributeEmail,
    attributeName,
    attributepreferred_username,
  ];

  const NUllAttributes: CognitoUserAttribute[] = [];

  return new Promise((resolve, reject) => {
    userPool.signUp(
      username,
      password,
      attributeList,
      NUllAttributes,
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result?.user);
      }
    );
  });
}

export function confirmSignUp(username: string, code: string) {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

export function ResendConfirmCode(username: string) {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

export function signIn(username: string, password: string) {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

////------------------////

export function forgotPassword(username: string) {
  return new Promise<void>((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export function confirmPassword(
  username: string,
  confirmationCode: string,
  newPassword: string
) {
  return new Promise<void>((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(confirmationCode, newPassword, {
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export function signOut() {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
}

interface AccessTokenPayload {
  sub: string;
  iss: string;
  client_id: string;
  origin_jti: string;
  event_id: string;
  token_use: string;
  scope: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  username: string;
}

interface AccessToken {
  jwtToken: string;
  payload: AccessTokenPayload;
}

interface User {
  sub: string;
  email_verified: string;
  name: string;
  preferred_username: string;
  email: string;
  accessToken: AccessToken;
}

export async function getCurrentUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error("No user found"));
      return;
    }

    cognitoUser.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }
      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }
        const userData = attributes?.reduce((acc: any, attribute: any) => {
          acc[attribute.Name] = attribute.Value;
          return acc;
        }, {});

        resolve({
          ...userData,
          accessToken: session.accessToken,
        });
      });
    });
  });
}

export function getSession() {
  const cognitoUser = userPool.getCurrentUser();
  return new Promise((resolve, reject) => {
    if (!cognitoUser) {
      reject(new Error("No user found"));
      return;
    }
    cognitoUser.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(session);
    });
  });
}