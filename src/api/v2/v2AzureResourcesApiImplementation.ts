import * as vscode from 'vscode';
import { BranchDataProviderManager } from '../../tree/v2/providers/BranchDataProviderManager';
import { ApplicationResourceProviderManager } from './providers/ApplicationResourceProviderManager';
import { ApplicationResource, ApplicationResourceProvider, BranchDataProvider, ResourceModelBase, V2AzureResourcesApi, WorkspaceResource, WorkspaceResourceProvider } from './v2AzureResourcesApi';

export class V2AzureResourcesApiImplementation implements V2AzureResourcesApi {
    public static apiVersion: string = '2.0.0';

    constructor(
        private readonly branchDataProviderManager: BranchDataProviderManager,
        private readonly resourceProviderManager: ApplicationResourceProviderManager,
    ) { }

    get apiVersion(): string {
        return V2AzureResourcesApiImplementation.apiVersion;
    }

    revealResource(_resourceId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    registerApplicationResourceProvider(_id: string, provider: ApplicationResourceProvider): vscode.Disposable {
        this.resourceProviderManager.addResourceProvider(provider);

        return new vscode.Disposable(() => this.resourceProviderManager.removeResourceProvider(provider));
    }

    registerApplicationResourceBranchDataProvider<T extends ResourceModelBase>(id: string, provider: BranchDataProvider<ApplicationResource, T>): vscode.Disposable {
        this.branchDataProviderManager.addApplicationResourceBranchDataProvider(id, provider);

        return new vscode.Disposable(() => this.branchDataProviderManager.removeApplicationResourceBranchDataProvider(id));
    }

    registerWorkspaceResourceProvider(_id: string, _provider: WorkspaceResourceProvider): vscode.Disposable {
        throw new Error("Method not implemented.");
    }

    registerWorkspaceResourceBranchDataProvider<T extends ResourceModelBase>(_id: string, _provider: BranchDataProvider<WorkspaceResource, T>): vscode.Disposable {
        throw new Error("Method not implemented.");
    }
}
