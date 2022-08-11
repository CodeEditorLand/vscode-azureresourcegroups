import { GenericResource, ResourceGroup } from '@azure/arm-resources';
import { getResourceGroupFromId, uiUtils } from "@microsoft/vscode-azext-azureutils";
import { callWithTelemetryAndErrorHandling, IActionContext, ISubscriptionContext, nonNullProp } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { createResourceClient } from '../../../utils/azureClients';
import { ApplicationResource, ApplicationResourceProvider, ApplicationSubscription, ProvideResourceOptions } from '../v2AzureResourcesApi';

export class BuiltInApplicationResourceProvider implements ApplicationResourceProvider {
    private readonly onDidChangeResourceEmitter = new vscode.EventEmitter<ApplicationResource | undefined>();

    getResources(subscription: ApplicationSubscription, _options?: ProvideResourceOptions | undefined): Promise<ApplicationResource[] | undefined> {
        return callWithTelemetryAndErrorHandling(
            'provideResources',
            async (context: IActionContext) => {
                const subContext: ISubscriptionContext = {
                    subscriptionDisplayName: '',
                    subscriptionPath: '',
                    tenantId: '',
                    userId: '',
                    ...subscription,
                    credentials: {
                        getToken: async (scopes?: string[]) => {
                            const session = await subscription.authentication.getSession(scopes);

                            if (session) {
                                return {
                                    token: session.accessToken
                                }
                            } else {
                                return null;
                            }
                        },
                        signRequest: () => { throw new Error('TODO: Not implemented (or localized)'); }
                    }
                };

                const client = await createResourceClient([context, subContext]);
                // Load more currently broken https://github.com/Azure/azure-sdk-for-js/issues/20380

                const allResources: GenericResource[] = await uiUtils.listAllIterator(client.resources.list());
                const appResources = allResources.map(resource => this.createAppResource(subscription, resource));

                const allResourceGroups: ResourceGroup[] = await uiUtils.listAllIterator(client.resourceGroups.list());
                const appResourcesResourceGroups = allResourceGroups.map(resource => this.fromResourceGroup(subscription, resource));

                return appResources.concat(appResourcesResourceGroups);
            });
    }

    onDidChangeResource = this.onDidChangeResourceEmitter.event;

    private fromResourceGroup(subscription: ApplicationSubscription, resourceGroup: ResourceGroup): ApplicationResource {
        return {
            ...resourceGroup,
            subscription,
            id: nonNullProp(resourceGroup, 'id'),
            name: nonNullProp(resourceGroup, 'name'),
            type: {
                type: nonNullProp(resourceGroup, 'type').toLowerCase()
            }
        };
    }

    private createAppResource(subscription: ApplicationSubscription, resource: GenericResource): ApplicationResource {
        const resourceId = nonNullProp(resource, 'id');

        return {
            ...resource,
            subscription,
            id: resourceId,
            name: nonNullProp(resource, 'name'),
            type: {
                type: nonNullProp(resource, 'type').toLowerCase(),
                kinds: resource.kind?.split(',')?.map(kind => kind.toLowerCase()),
            },
            resourceGroup: getResourceGroupFromId(resourceId),
            location: resource.location,
        };
    }
}
