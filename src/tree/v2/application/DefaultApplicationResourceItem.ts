/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { ApplicationResource, ResourceModelBase } from '../../../api/v2/v2AzureResourcesApi';
import { getIconPath } from '../../../utils/azureUtils';

export class DefaultApplicationResourceItem implements ResourceModelBase {
    constructor(private readonly resource: ApplicationResource) { }

    public readonly id: string = getApplicationResourceId(this.resource.id);

    getChildren(): vscode.ProviderResult<DefaultApplicationResourceItem[]> {
        return undefined;
    }

    getTreeItem(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const treeItem = new vscode.TreeItem(this.resource.name ?? 'Unnamed Resource');

        treeItem.iconPath = getIconPath(this.resource.resourceType);

        treeItem.contextValue = 'azureResource';
        treeItem.id = this.id;

        return treeItem;
    }
}

export function getApplicationResourceId(id: string): string {
    const splitId = id.split(/(resourceGroups)/);
    return splitId[1] + splitId[2];
}
